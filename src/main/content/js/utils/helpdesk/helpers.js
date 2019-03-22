/**
 * Фильтрация детей списка
 * @param {Object} parent родитель => {Object} citem ребенок
 * @return {boolean}
 */
function filterChildrenHelpdeskHelper(parent) {
    return citem => citem.parentId === parent.id && citem.parentId !== null;
}

/**
 * Получить детей переданного объекта
 * @param {Array} options общий массив объектов
 * @param {Object} target объект, детей которого нужно найти
 * @return {Array} - массив под-детей
 */
function getChildrenHelpdeskHelper(options, target) {
    return options.filter(filterChildrenHelpdeskHelper(target));
}

/**
 * Рекурсивно получить всех под-детей для переданного массива детей
 * с возможностью форматирования префиксом
 * @param {Array} options общий массив
 * @param {Array} children массив детей
 * @param {string} prefix префикс для детей
 * @return {Object}
 */
function getSubChildrenRecursivelyHelpdeskHelper(options, children, prefix = '') {
    return children.reduce((resultArray, singleChild) => {
        const subChildren = getChildrenHelpdeskHelper(options, singleChild);
        const resultChild = prefix ? {
            ...singleChild,
            name: `${prefix}${singleChild.name}`,
        } : singleChild;

        resultArray.push(resultChild);

        if (subChildren.length) {
            prefix += prefix;
            resultArray.push(...getSubChildrenRecursivelyHelpdeskHelper(options, subChildren, prefix));
            prefix = prefix.slice(2);
        }

        return resultArray;
    }, []);
}

/**
 * Изменить имена проблем для нового классификатора
 * @param {Array} problems массив проблем
 * @return {Array}
 */
function remapProblemsForABTestHelpdeskHelper(problems) {
    return problems.map(problem => ({
        ...problem,
        name: problem.id > 103 ? `${problem.name} [new]` : problem.name,
    }));
}