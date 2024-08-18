const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
    name: String,
    email: String,
    message: String,
});

mongoose.model("Message", messageSchema);
