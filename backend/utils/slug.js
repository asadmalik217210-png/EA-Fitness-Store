const slugify = require('slugify');

function toSlug(value) {
  return slugify(String(value || ''), { lower: true, strict: true, trim: true });
}

module.exports = { toSlug };
