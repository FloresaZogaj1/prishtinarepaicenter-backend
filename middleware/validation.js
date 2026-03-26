const { body, validationResult } = require('express-validator');

// Validime për postime
const postValidation = [
  body('title').notEmpty().withMessage('Titulli është i detyrueshëm'),
  body('content').notEmpty().withMessage('Përmbajtja është e detyrueshme')
];

// Validime për shërbime
const serviceValidation = [
  body('name').notEmpty().withMessage('Emri është i detyrueshëm'),
  body('description').notEmpty().withMessage('Përshkrimi është i detyrueshëm'),
  body('price').notEmpty().withMessage('Çmimi është i detyrueshëm').isFloat({ min: 0 }).withMessage('Çmimi duhet të jetë numër pozitiv'),
  body('duration').notEmpty().withMessage('Kohëzgjatja është e detyrueshme').isInt({ min: 1 }).withMessage('Kohëzgjatja duhet të jetë numër pozitiv'),
  body('category').notEmpty().withMessage('Kategoria është e detyrueshme')
    .isIn(['mechanic', 'bodywork', 'detailing', 'electrical', 'other']).withMessage('Kategoria nuk është valide'),
  body('image').optional().isString(),
  body('icon').optional().isString(),
  body('cta').optional().isIn(['book', 'whatsapp']).withMessage('CTA duhet të jetë book ose whatsapp')
];

// Middleware për të kontrolluar rezultatet e validimit
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

module.exports = { postValidation, serviceValidation, validate };
