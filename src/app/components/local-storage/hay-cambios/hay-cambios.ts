export const localStorageHayCambios = (hayCambios : boolean) => {
    hayCambios ?  localStorage.setItem('haycambios', 'true') : localStorage.setItem('haycambios', 'false') ;
}