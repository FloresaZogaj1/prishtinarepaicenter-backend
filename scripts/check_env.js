const required = ['JWT_SECRET', 'MONGO_URI'];
let missing = [];
for (const r of required) {
  if (!process.env[r]) missing.push(r);
}
if (missing.length) {
  console.error('Missing required env vars:', missing.join(', '));
  process.exit(1);
}
console.log('All required env vars present');
