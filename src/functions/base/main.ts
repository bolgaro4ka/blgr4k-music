export function deleteFromArray(array: any[], item : any) {

    const index = array.indexOf(item)

    if (index !== -1) {
        return array.splice(index, 1)
    } else {
        return array
    }
}
