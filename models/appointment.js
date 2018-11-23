const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var AppointmentSchema = new Schema({
  title: { type: String, required: "Appointment title is required" },
  dateAndTime: { type: Date, required: "Appointment start date is required" },
  endDateAndTime: { type: Date, required: "Appointment end date is required" }
});

AppointmentSchema.path("dateAndTime").validate((value, done) => {
  done(value > new Date());
}, "The appointment cannot be scheduled in the past");

AppointmentSchema.path("endDateAndTime").validate((value, done) => {
  done(value && this.dateAndTime && value > this.dateAndTime);
}, "End date must be greater than start date");

AppointmentSchema.path("dateAndTime").validate((value, done) => {
  var self = this;
  return mongoose.models.Appointment.find(
    {
      _id: { $ne: self._id },
      $or: [
        { dateAndTime: { $lt: self.endDateAndTime, $gte: self.dateAndTime } },
        { endDateAndTime: { $lte: self.endDateAndTime, $gt: self.dateAndTime } }
      ]
    },
    (err, appointments) => {
      done(!appointments || appointments.length === 0);
    }
  );
}, "The appointment overlaps with other appointments");

module.exports = mongoose.model("Appointment", AppointmentSchema);
