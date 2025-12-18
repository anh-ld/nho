import { Nho } from "../src/index.js";

Nho.style = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: system-ui, sans-serif;
  }

  h1 {
    margin-bottom: 20px;
  }

  input {
    width: 100%;
    margin-bottom: 20px;
    border-radius: 0;
    outline: none;
    padding: 8px;
    border: 1px solid black;
  }

  button {
    cursor: pointer;
    border: none;
    padding: 8px;
  }

  .selected {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: PaleTurquoise;
    align-items: center;
    overflow: auto;
    padding: 16px;
  }

  .selected-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .selected-close {
    background: black;
    color: white;
  }

  .selected .images, .albums {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .selected .image-item {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .selected .image-item div:first-child {
    height: 48px;
    width: 48px;
    min-height: 48px;
    min-width: 48px;
    border: 1px dotted grey;
  }

  .album-item {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .album-item button {
    background: PaleTurquoise;
    color: blue;
    flex-shrink: 0;
  }

  .album-item dev {
    flex: 1;
  }
`;

class SelectedAlbum extends Nho {
  render(h) {
    return h`
      <div class="selected">
        <div>
          <div class="selected-title">
            <h1>Album ${this.props.album[0].albumId} images</h1>
            <button onclick=${this.props.hide} class="selected-close">Close</button>
          </div>
          <div class="images">
            ${this.props.album.map(
              (img) => h`
              <div class="image-item">
                <div style="background: #${img.thumbnailUrl.split("/").slice(-1)[0]}"></div>
                <div>${img.title}</div>
              </div>
            `,
            )}
          </div>
        </div>
      </div>
    `;
  }
}

class AlbumItem extends Nho {
  render(h) {
    return h`
      <div class="album-item">
        <button onclick=${this.props.view}>View album images</button>
        <div>${this.props.title}</div>
      </div>
    `;
  }
}

class AlbumList extends Nho {
  setup() {
    this.state = this.reactive({
      albums: [],
      isFetched: false,
      selectedAlbum: undefined,
      search: "",
    });
    this.h1Ref = this.ref();

    this.effect(
      () => this.state.search,
      (oldValue, newValue) => console.log(oldValue, newValue),
    );
  }

  matchedAlbums() {
    if (!this.state.search) return this.state.albums;
    return this.state.albums.filter((v) => v.title.toLowerCase().includes(this.state.search.toLowerCase()));
  }

  async onMounted() {
    const response = await fetch("https://jsonplaceholder.typicode.com/albums");
    this.state.albums = (await response.json()) || [];
    this.state.isFetched = true;
  }

  onUpdated() {
    console.log("H1 Ref", this.h1Ref?.current);
  }

  async viewAlbum(id) {
    const response = await fetch(`https://jsonplaceholder.typicode.com/albums/${id}/photos`);
    this.state.selectedAlbum = (await response.json()) || [];
    document.body.style.overflow = "hidden";
  }

  hideAlbum() {
    this.state.selectedAlbum = undefined;
    document.body.style.overflow = "initial";
  }

  searchValue(e) {
    this.state.search = e.target.value;
  }

  render(h) {
    if (!this.state.isFetched) return h`<div class="loading">fetching albums...</div>`;
    if (!this.state.albums.length) return h`<div>no albums found</div>`;

    return h`
      <div>
        <h1 ref=${this.h1Ref}>Albums</h1>
        <input
          placeholder="Search album"
          value=${this.state.search}
          oninput=${this.searchValue}
        />
        <div class="albums">
          ${this.matchedAlbums().map(
            (album) => h`<album-item p:title=${album.title} p:view=${() => this.viewAlbum(album.id)}></album-item>`,
          )}
        </div>
        ${
          this.state.selectedAlbum
            ? h`<selected-album p:album=${this.state.selectedAlbum} p:hide=${this.hideAlbum}></selected-album>`
            : ""
        }
      </div>
    `;
  }
}

customElements.define("album-list", AlbumList);
customElements.define("album-item", AlbumItem);
customElements.define("selected-album", SelectedAlbum);
