import { Request, Response } from 'express';

export const uploadFile = (req: Request, res: Response) => {
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
