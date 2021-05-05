module.exports = {
    postStartOneTime: [
        require("./eventmesh-successfactors-consumer"),
        // require("./cron-jobs"),
     ],
};
