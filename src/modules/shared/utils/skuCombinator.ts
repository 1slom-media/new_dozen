export default function skuCombinator(
    SKUs: {
        title: { uz: string; ru: string; en: string };
        sku: string;
    }[][]
) {
    const result = [];
    const indices = new Array(SKUs.length).fill(0);

    function generateCombination() {
        const combination = indices.map((arrayIndex, valueIndex) => {
            return SKUs[valueIndex][arrayIndex];
        });
        result.push(combination);
    }

    while (true) {
        generateCombination();

        let next = SKUs.length - 1;
        indices[next]++;

        while (next > 0 && indices[next] >= SKUs[next].length) {
            indices[next] = 0;
            next--;
            indices[next]++;
        }

        if (next === 0 && indices[next] >= SKUs[next].length) {
            break;
        }
    }

    return result;
}
