import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { RequestHandler } from 'express';
import HttpException from '@/errors/http-exception';
import { StatusCodes } from 'http-status-codes';
import { ErrorMessages } from '@/constants/error-messages';

function validationMiddleware(type: any, skipMissingProperties = false): RequestHandler {
    return (req, res, next) => {
        if (!req.body) {
            const error = new HttpException(StatusCodes.BAD_REQUEST, ErrorMessages.INVALID_REQUEST_BODY);
            res.status(StatusCodes.BAD_REQUEST).json(error.getError());
            return;
        }

        validate(plainToInstance(type, req.body), { skipMissingProperties })
            .then((errors: ValidationError[]) => {
                if (errors.length > 0) {
                    const errorMessages = errors.map((error: ValidationError) => {
                        return error.constraints;
                    });
                    const error = new HttpException(StatusCodes.BAD_REQUEST, ErrorMessages.INVALID_REQUEST_BODY, errorMessages);
                    res.status(StatusCodes.BAD_REQUEST).json(error.getError());
                    return;
                }
                next();
            });
    };
}

export default validationMiddleware;