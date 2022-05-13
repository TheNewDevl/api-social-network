import { BadRequestException } from '@nestjs/common';

type Mimetype = {
  [key: string]: string;
};
const MIME_TYPES: Mimetype = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/gif': 'gif',
};

/** Set limits for upload files */
export const limits = {
  files: 1,
};

/** compose a custmo file name for the file that will be saved */
export const customFileName = (req, file, fncallback) => {
  const name = file.originalname.split(' ').join('_').replace('.', '');
  const extension = MIME_TYPES[file.mimetype];
  fncallback(null, name + Date.now() + '.' + extension);
};

/** Filter upload files. Only accept the mimetypes in the MIME_TYPES object */
export const fileFilter = (req, file, fncallback) => {
  if (!MIME_TYPES[file.mimetype]) {
    return fncallback(
      new BadRequestException('Format de fichier non supporté'),
      false,
    );
  }
  fncallback(null, true);
};
