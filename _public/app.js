import {modules} from "./modules.js";

function renderIndex({
  title,
  modules 
}) {
  return `<h1>${title}</h1>
    <ul>
      ${modules.map(({id, name}) => 
        `<li><a 
          href="${id}">${name}</a></li>`)}
    </ul>`;
}

function renderModule({
  title,
  modules 
}) {
  return ``;
}

Promise.all(
  modules.map(id => 
    import(`./${id}/module.js`)
    .then(module => ({id, ...module}))))
  .then((modules) => {
    const data = {
      title: "Modules",
      modules: modules
        .map(module => ({
          id: module.id, 
          ...module.info()
        }))
    };

    document.getElementById("app")
      .innerHTML = renderIndex(data); 
  });
