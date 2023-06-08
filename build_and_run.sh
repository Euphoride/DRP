cd public/drp-37
npx prettier --write .
npm i
npm run build
cd ../../api
npx prettier --write .
tsc
npm i
npm start

