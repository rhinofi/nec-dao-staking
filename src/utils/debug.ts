import { Batch, Lock } from 'types';

export const printBatches = (batches: Map<number, Batch>
) => {
    batches.forEach((value, key, map) => {
        // console.log(key);
        printBatch(value);
    });
}

const printBatch = (batch: Batch) => {
    // console.table(batch);
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
