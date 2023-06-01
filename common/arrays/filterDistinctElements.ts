export function filterDistinctElements(array: any[]) {
    return array.filter((value, index, array) => array.indexOf(value) === index);
}
