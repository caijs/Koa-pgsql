const Router = require('koa-router');

const router = new Router();
const multer = require('koa-multer');
const os = require('os');
const upload = multer({ dest: os.tmpdir() });
const fs = require('fs');
const csv = require('csv');
const cargo = require('async/cargo');
const { evaluateAll, getSpreadsheet, authWithGoogle } = require('../services/sheets');
const bcrypt = require('bcrypt');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: true
  }

});
const SheetVersion = require('../models/sheetversion')(sequelize, Sequelize.DataTypes);
const StarRating = require('../models/starrating')(sequelize, Sequelize.DataTypes);
const StaffingData = require('../models/staffingdata')(sequelize, Sequelize.DataTypes);

const User = require('../models/user')(sequelize, Sequelize.DataTypes);
const UserFacility = require('../models/userfacility')(sequelize, Sequelize.DataTypes);
User.belongsToMany(StaffingData, {through: UserFacility, foreignKey: 'userId', otherKey: 'federalProviderNumber'});

const starRatingsCsvToDb = (l) => {
  return {
    federalProviderNumber: l["Federal Provider Number"],
    providerName: l["Provider Name"],
    providerState: l["Provider State"],
    overallRating: parseInt(l["Overall Rating"]) || null,
    healthInspectionRating: parseInt(l["Health Inspection Rating"]) || null,
    qmRating: parseInt(l["QM Rating"]) || null,
    staffingRating: parseInt(l["Staffing Rating"]) || null,
    rnStaffingRating: parseInt(l["RN Staffing Rating"]) || null,
    location: l["Location"],
  };
};

const flt = (l, field) => {
  return parseFloat(l[field]) || null;
};

const staffingDataCsvToDb = (l) => {
  return {
    federalProviderNumber: l["Federal Provider Number"],
    providerName: l["Provider Name"],
    providerState: l["Provider State"],
    staffingRating: parseInt(l["Staffing Rating"]) || null,
    rnStaffingRating: parseInt(l["RN Staffing Rating"]) || null,
    repCnaHPD: flt(l,"Reported CNA Staffing Hours per Resident per Day"),
    repLpnHPD: flt(l,"Reported LPN Staffing Hours per Resident per Day"),
    repRnHPD: flt(l, "Reported RN Staffing Hours per Resident per Day"),
    repLicHPD: flt(l, "Reported Licensed Staffing Hours per Resident per Day"),
    repTotalHPD: flt(l, "Reported Total Nurse Staffing Hours per Resident per Day"),
    repPtHPD: flt(l, "Reported Physical Therapist Staffing Hours per Resident Per Day"),
    expCnaHPD: flt(l, "Expected CNA Staffing Hours per Resident per Day"),
    expLpnHPD: flt(l, "Expected LPN Staffing Hours per Resident per Day"),
    expRnHPD: flt(l, "Expected RN Staffing Hours per Resident per Day"),
    expTotalHPD: flt(l, "Expected Total Nurse Staffing Hours per Resident per Day"),
    adjCnaHPD: flt(l, "Adjusted CNA Staffing Hours per Resident per Day"),
    adjLpnHPD: flt(l, "Adjusted LPN Staffing Hours per Resident per Day"),
    adjRnHPD: flt(l, "Adjusted RN Staffing Hours per Resident per Day"),
    adjTotalHPD: flt(l, "Adjusted Total Nurse Staffing Hours per Resident per Day"),
    location: l["Location"],
    processingDate: l["Processing Date"],
  };
};

const readCsvToDb = (csvPath, model, serializer) => {
  return new Promise(async (resolve, reject) => {
    const stream = fs.createReadStream(csvPath);
    const parser = csv.parse({
      columns: true,
      relax: true,
    });

    stream.on('error', (err) => {
      reject({ error: err });
    });

    // Clear out current StarRating Data
    await model.truncate();

    const buffer = cargo((rows, callback) => {
      model.bulkCreate(rows)
      .then(() => {
        callback();
      });
    }, 500);

    buffer.drain = () => {
      resolve({ error: null });
    };

    parser.on('readable', async () => {
      let line;
      while(line = parser.read()) {
        const dbRow = serializer(line);
        if(dbRow.federalProviderNumber) {
          buffer.push(dbRow, (err) => {
            if(err) {
              reject({ error: err });
            }
          });
        }
      }
    });

    stream.pipe(parser);
  })
}

const authCheck = (ctx, next) => {
  if(ctx.isAuthenticated()) {
    return next()
  }
  ctx.body = {success: false};
  ctx.throw(401);
};

const adminCheck = (ctx, next) => {
  if(ctx.state.user.admin) {
    return next();
  }
  ctx.body = { success: false};
  ctx.throw(401);
}

module.exports = (passport) => {
  router.post('/api/login', passport.authenticate('local'), (ctx) => {
    ctx.body = { success: true, user: ctx.user};
  });

  router.post('/api/logout', (ctx) => {
    ctx.logout();
    ctx.body = { success: true };
  });

  router.use(authCheck);

  router.get('/api/auth', async (ctx) => {
    ctx.body = { success: true, user: ctx.state.user };
  });

  router.post('/api/analyze', async (ctx, next) => {
    // Read in current state of spreadsheet table from DB
    const sheetsVersions = await SheetVersion.findAll({
      limit: 1,
      order: [[ 'createdAt', 'DESC']]
    });

    const activeSheet = sheetsVersions[0].dataValues;
   
    const inputs = ctx.request.body;

    // TODO If inputs are valid
    if(inputs && inputs.federalProviderNumber) {
      // Pull in auxilliary data
      const staffingData = await StaffingData.findAll({
        limit: 1,
        where: {federalProviderNumber: inputs.federalProviderNumber},
      });

      const starRatings = await StarRating.findAll({
        limit: 1,
        where: {federalProviderNumber: inputs.federalProviderNumber},
      })

      const data = [staffingData[0].dataValues, starRatings[0].dataValues];
      // Evaluate sheet with inputs + auxilliary data
      const results = await evaluateAll({
        cells: activeSheet.cells,
        inputs,
        data,
      });

      ctx.response.body = results;
    }
    else {
      ctx.status = 400;
    }
  });

  router.post('/api/spreadsheet', adminCheck, async (ctx, next) => {
    const auth = await authWithGoogle();

    // Read in current state of spreadsheet from Google
    const cells = await getSpreadsheet(auth);

    // Save to db
    await SheetVersion.create({cells});

    ctx.body = cells;
  });

  router.post('/api/stars', adminCheck, upload.single('starRatings'), async(ctx, next) => {
    const file = ctx.req.file;

    const result = await readCsvToDb(file.path, StarRating, starRatingsCsvToDb);

    if(result.error) {
      ctx.status = 400;
      console.error(result.error);
      ctx.body = "Upload failed";
    }
    else {
      ctx.body = "SUCCESS";
    }
  });

  router.post('/api/staffing-data', adminCheck, upload.single('staffingData'), async(ctx, next) => {
    const file = ctx.req.file;

    const result = await readCsvToDb(file.path, StaffingData, staffingDataCsvToDb);

    if(result.error) {
      ctx.status = 400;
      console.error(result.error);
      ctx.body = "Upload failed";
    }
    else {
      ctx.body = "SUCCESS";
    }
  });

  router.get('/api/staffing-data', async(ctx, next) => {
    const {q, s} = ctx.request.query;
    const user = ctx.state.user;

    if(!q && !s) {
      ctx.body = [];
    }
    else {
      const whereClause = {};
      if(q) {
        whereClause.providerName = {
          [Op.like]: '%' + q.toUpperCase() + '%',
        };
      }
      if(s) {
        whereClause.providerState = s.toUpperCase();
      }
      if(!user.admin) {
        // Limited to facilities
        const usersFacilities = await UserFacility.findAll({where: {userId: user.id}});
        const fedPNs = usersFacilities.map(uf => uf.federalProviderNumber);

        whereClause.federalProviderNumber = {
          [Op.in]: fedPNs,
        };
      }

      const data = await StaffingData.findAll({where: whereClause});
      ctx.body = data;
    }
  });

  router.get('/api/staffing-data/:id', async ctx => {
    ctx.body = await StaffingData.findById(ctx.params.id);
  });

  router.get('/api/users', adminCheck, async(ctx) => {
    ctx.body = await User.findAll({
      include: [
        {
          model: StaffingData,
        }
      ]
    });
  });

  router.post('/api/users', adminCheck, async(ctx, next) => {
    try {
      const body = ctx.request.body;
      // body.password = await bcrypt.hash(body.password, 10);

      const user = await User.create(body);
      ctx.body = await User.findById(user.id, {
        include: [
          {
            model: StaffingData,
          }
        ]
      });
    }
    catch(e) {
      console.error(e);
      ctx.status = 400;
    }
  });

  router.put('/api/users/:id', adminCheck, async ctx => {
    try {
      const user = await User.findById(ctx.params.id);
      if(!user) {
        ctx.throw(404);
      }

      const body = ctx.request.body;
      const facilitiesChanges = body.facilities;
      if(facilitiesChanges) {
        const { additions, deletions } = facilitiesChanges;

        for(let i = 0; i < additions.length; i ++) {
          await user.addStaffingData(additions[i]);
        }

        for(let j = 0; j < deletions.length; j ++) {
          await user.removeStaffingData(deletions[j]);
        }
      }

      const updatedUser = await user.update(body);
      ctx.body = await User.findById(updatedUser.id, {
        include: [
          {
            model: StaffingData,
          }
        ]
      });
    }
    catch(e) {
      console.error(e);
      ctx.status = 400;
    }
  });
 
  router.delete('/api/users/:id', adminCheck, async(ctx, next) => {
    try {
      const user = await User.findById(ctx.params.id);
      await user.destroy();
      ctx.status = 204;
    }
    catch(e) {
      console.error(e);
      ctx.status = 400;
    }
  });

  return router;
}

module.exports.User = User;
