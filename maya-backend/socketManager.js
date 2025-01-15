// maya-backend/socketManager.js
const users = {};
let io = null;

const setIo = (newIo) => {
  io = newIo;
};

module.exports = { users, io, setIo };