"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const uploadFile = (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/files/${req.file.filename}`;
    res.status(200).send({
        message: 'File uploaded successfully',
        url: fileUrl,
        file: req.file,
    });
};
exports.uploadFile = uploadFile;
