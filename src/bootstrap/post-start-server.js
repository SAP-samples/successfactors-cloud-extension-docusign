const { postStartOneTime } = require("../handlers")

const postStart = async (appContainer) => {
  postStartOneTime.forEach((h) => {
    appContainer.inject(h)
  })
};

module.exports = {
  postStart,
};
