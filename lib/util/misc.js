/**
 * A utility to lookup tasks given a task ID
 *
 * @public
 * @param {Number} An ID referencing a task
 * @returns The Task instance whose ID matches the argument
 */
exports.findTaskById = function (tasks, taskID) {
    return tasks.filter(function (task, i, arr) {
        return (task.meta.id == taskID);
    }).shift();
};
