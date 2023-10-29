import { Distribution } from "./Distribution";

export function filterByIntersection<Tvalue>(
    mainDist: Distribution<Tvalue>, 
    filterDist: Distribution<Tvalue>,
    combineWeights: boolean = false
): Distribution<Tvalue> {
    
    const intersectedDistribution: Distribution<Tvalue> = {
        values: [],
        weights: [],
    };

    mainDist.values.forEach((value, index) => {
        const filterIndex = filterDist.values.findIndex(
            v => objectsAreEqual(v, value)
        );
        if (filterIndex !== -1) {
            intersectedDistribution.values.push(value);
            if (combineWeights) {
                intersectedDistribution.weights.push(mainDist.weights[index] + filterDist.weights[filterIndex]);
            } else {
                intersectedDistribution.weights.push(mainDist.weights[index]);
            }
        }
    });

    return intersectedDistribution;
}

//deep object comparison from here: https://www.syncfusion.com/blogs/post/deep-compare-javascript-objects.aspx

function objectsAreEqual(a: any, b: any): boolean {
    const aProps = Object.getOwnPropertyNames(a);
    const bProps = Object.getOwnPropertyNames(b);

    if (aProps.length !== bProps.length) {
        return false;
    }

    for (let i = 0; i < aProps.length; i++) {
        const propName = aProps[i];

        if (typeof a[propName] === 'object' && typeof b[propName] === 'object') {
            if (!objectsAreEqual(a[propName], b[propName])) {
                return false;
            }
        } else if (a[propName] !== b[propName]) {
            return false;
        }
    }

    return true;
}
