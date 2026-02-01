const { z } = require('zod');

/**
 * Middleware factory for Zod validation
 * @param {z.ZodSchema} schema - The Zod schema to validate against
 * @param {'body'|'query'|'params'} source - The part of the request to validate (default: 'body')
 */
const validate = (schema, source = 'body') => (req, res, next) => {
    try {
        // Parse the data against the schema
        // detailed error messages are generated automatically by Zod
        const parsedData = schema.parse(req[source]);

        // Replace the request data with the parsed (and potentially transformed) data
        req[source] = parsedData;

        next();
    } catch (err) {
        if (err instanceof z.ZodError) {
            // Format Zod errors into a readable object
            const errors = err.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }));

            return res.status(400).json({
                message: "Validation failed",
                errors
            });
        }

        // Pass other errors to the default error handler
        next(err);
    }
};

module.exports = validate;
