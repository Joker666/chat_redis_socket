import os from 'os';
import cluster from 'cluster';

const clusterWorkerSize = os.cpus().length;

if (clusterWorkerSize > 1) {
    if (cluster.isMaster) {
        for (let i=0; i < clusterWorkerSize; i++) {
            cluster.fork();
        }

        cluster.on("exit", function(worker, code, signal) {
            console.log("Worker", worker.id, "has exited with signal", signal);
        });
    } else {
        require('./index');
    }
} else {
    require('./index');
}
