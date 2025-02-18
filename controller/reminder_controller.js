let {database} = require("../models/userModel");
let {db} = require("../models/userModel");

let remindersController = {
  list: async (req, res) => {
    const reminders = await db.reminder.findMany({
      where: { userId: req.user.id }
    })
    // let index_user = database.findIndex((user) => user.id === req.user.id)
    res.render("reminder/index", { reminders: reminders });
  }
};

module.exports = remindersController;
