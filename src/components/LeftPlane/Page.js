
class Page {
  constructor(name = '', id = 0, style = { width: 600, height: 300, background: 'none', backgroundColor: '#fff', backgroundImage: 'none' }, componentsData = []) {
    this.name = name;
    this.id = id;
    this.style = style;
    this.componentsData = componentsData;
  }
}

export default Page
