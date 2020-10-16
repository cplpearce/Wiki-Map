# Wiki-Map
A web app that allows users to collaboratively create maps which list multiple "points". For example: "Best Places to Eat Around Town" or "Locations of Movie Scenes".

## Project Setup
1. Install dependencies: `npm i`
2. Fix to binaries for sass: `npm rebuild node-sass`
3. Reset database: `npm run db:reset`
  - Check the db folder to see what gets created and seeded in the SDB
4. Run the server: `npm run local`
  - Note: nodemon is used, so you should not have to restart your server
5. Visit `http://localhost:8080/`

## Dependencies

- Node 10.x or above
- NPM 5.x or above
- PG 6.x

## Screenshots
### View a Map
![View Map](https://github.com/cplpearce/Wiki-Map/blob/master/screenshots/NewMapView.png)
### Edit a Map
![Edit Map](https://github.com/cplpearce/Wiki-Map/blob/master/screenshots/EditMap.png)
### Edit a Map
![Map Settings](https://github.com/cplpearce/Wiki-Map/blob/master/screenshots/MapSettings.png)
### Edit a Map
![User Prodile](https://github.com/cplpearce/Wiki-Map/blob/master/screenshots/Profile.png)
### View My Maps
![View My Maps](https://github.com/cplpearce/Wiki-Map/blob/master/screenshots/ViewMyMaps.png)
