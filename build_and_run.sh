cd public/drp-37
npx prettier --write .
npm i
npm run build
cd ../../api
npx prettier --write .
npx tsc
npm i
npm start

