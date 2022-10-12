const { getTrips, getDriver, getVehicle } = require("api");

async function driverReport() {
  const allTrips = await getTrips();
  const allDrivers = {};
  for (let i = 0; i < allTrips.length; i++) {
    try {
      let currentDriverID = allTrips[i].driverID;
      const driver = await getDriver(currentDriverID);
      allDrivers[currentDriverID] = driver;
      //creating a new property called vehicle and se it to new array
      allDrivers[currentDriverID]["vehicle"] = [];
      if (driver.vehicleID.length > 1) {
        for (let j = 0; j < driver.vehicleID.length; j++) {
          const vehicle = await getVehicle(driver.vehicleID[j]);
          allDrivers[allTrips[i].driverID]["vehicle"].push(vehicle);
        }
      } else {
        const vehicle = await getVehicle(driver.vehicleID);
        allDrivers[currentDriverID]["vehicle"].push(vehicle);
      }
    } catch (error) {
      continue;
    }
  }
  const output = [];
  let userObj = {
    fullname: "",
    phone: "",
    id: "",
    vehicles: [],
    noOfTrips: 0,
    noOfCashTrips: 0,
    noOfNonCashTrips: 0,
    trips: [],
    totalAmountEarned: 0,
    totalCashAmount: 0,
    totalNonCashAmount: 0,
  };
  let userVehicle = {
    plate: "",
    manufacturer: "",
  };
  let userTrip = {
    user: "",
    created: "",
    pickup: "",
    destination: "",
    billed: 0,
    isCash: false,
  };
  const copyOfUserObj = JSON.parse(JSON.stringify(userObj));
  const copyOfUserVehicle = JSON.parse(JSON.stringify(userVehicle));
  const copyOfUserTrip = JSON.parse(JSON.stringify(userTrip));
  for (const key in allDrivers) {
    for (let i = 0; i < allTrips.length; i++) {
      if (key === allTrips[i].driverID) {
        userObj.totalAmountEarned +=
          Number(allTrips[i].billedAmount) ||
          Number(allTrips[i].billedAmount.split(",").join(""));
        userObj.noOfTrips++;
        userObj.id = key;
        userObj.fullname = allDrivers[key].name;
        userObj.phone = allDrivers[key].phone;
        if (allTrips[i].isCash === true) {
          userObj.totalCashAmount +=
            Number(allTrips[i].billedAmount) ||
            Number(allTrips[i].billedAmount.split(",").join(""));
          userObj.noOfCashTrips++;
        } else {
          userObj.totalNonCashAmount +=
            Number(allTrips[i].billedAmount) ||
            Number(allTrips[i].billedAmount.split(",").join(""));
          userObj.noOfNonCashTrips++;
        }
        userTrip.user = allTrips[i].user.name;
        userTrip.created = allTrips[i].created;
        userTrip.pickup = allTrips[i].pickup.address;
        userTrip.destination = allTrips[i].destination.address;
        userTrip.isCash = allTrips[i].isCash;
        userTrip.billed =
          Number(allTrips[i].billedAmount) ||
          Number(allTrips[i].billedAmount.split(",").join(""));
        let currentDriverVehicleArray = allDrivers[key].vehicle;
        for (let j = 0; j < currentDriverVehicleArray.length; j++) {
          let currentVehicle = allDrivers[key].vehicle[j];
          userVehicle.plate = currentVehicle.plate;
          userVehicle.manufacturer = currentVehicle.manufacturer;
          if (userObj.vehicles.length < currentDriverVehicleArray.length) {
            userObj.vehicles.push(userVehicle);
            userVehicle = JSON.parse(JSON.stringify(copyOfUserVehicle));
          }
        }
        userObj.trips.push(userTrip);
        userTrip = JSON.parse(JSON.stringify(copyOfUserTrip));
      }
    }
    userObj.totalAmountEarned = Number(
      userObj.totalAmountEarned.toFixed(2)
    );
    userObj.totalCashAmount = Number(userObj.totalCashAmount.toFixed(2));
    userObj.totalNonCashAmount = Number(
      userObj.totalNonCashAmount.toFixed(2)
    );
    output.push(userObj);
    userObj = JSON.parse(JSON.stringify(copyOfUserObj));
  }
  return output;
}
module.exports = driverReport;
driverReport();
