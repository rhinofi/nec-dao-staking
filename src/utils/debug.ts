import { Batch, Lock } from 'types';

export const printBatches = (batches: Map<number, Batch>
) => {
    batches.forEach((value, key, map) => {
        // console.log(key);
        printBatch(value);
    });
}

export const printBatch = (batch: Batch) => {
    const print: any = {}
    print.id = batch.id
    print.totalLocked = batch.totalLocked.toString()
    print.totalRep = batch.totalRep.toString()
    print.totalScore = batch.totalScore.toString()
    print.userLocked = batch.userLocked.toString()
    print.userRep = batch.userRep.toString()
    print.userScore = batch.userScore.toString()
    console.table(print);
}

const printLocks = () => {

}

const printLock = () => {

}

export const printParams = (params) => {
    Object.keys(params).forEach((key) => {
        console.log(`${key}: ${params[key]}`);
    })
}
