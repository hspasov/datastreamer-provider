function scaleImageMeasures(measures, biggerMeasureMaxSize) {
    if (!measures.width || !measures.height) {
        throw new Error("First argument must be an object with properties 'width' and 'height'.");
    }
    let width, height;
    const widthToHeightRatio = measures.width / measures.height;
    if (measures.width >= measures.height) {
        width = biggerMeasureMaxSize;
        height = width / widthToHeightRatio;
    } else {
        height = biggerMeasureMaxSize;
        width = height * widthToHeightRatio;
    }
    return { width, height };
}

export default scaleImageMeasures;