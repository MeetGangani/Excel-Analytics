const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, 'Please provide a filename'],
      trim: true
    },
    originalName: {
      type: String,
      required: [true, 'Original filename is required']
    },
    contentType: {
      type: String,
      required: [true, 'Content type is required']
    },
    size: {
      type: Number,
      required: [true, 'File size is required']
    },
    content: {
      type: Buffer,
      required: [true, 'File content is required']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    }
  },
  {
    timestamps: true
  }
);

// Add methods to FileSchema
FileSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

FileSchema.methods.toJSON = function () {
  const file = this.toObject();
  // Don't send the file content in the response
  delete file.content;
  return file;
};

module.exports = mongoose.model('File', FileSchema); 