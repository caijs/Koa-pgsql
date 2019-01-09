# Site Architecture
## Principles
The architecture is designed to make the user experience for the two classes of users of this product as convenient as possible. For the administrators at Care Consulting: instead of making formula updates in a database or in a web form, the familiar spreadsheet environment is preferred.

For the clients of Care Consulting: instead of inputting data into a spreadsheet, a user-friendly web form is preferred. This form will provide feedback based on the user's inputs.

Finally, to the degree that it doesn't interfere with the above, the architecture is designed to be extensible, navigable, and user-friendly for future developers.

## Tech Stack
* Koa (Backend)
* React (UI)
* Google Sheets API (Admin formulas)
* Redux (State-management)
