import { createApp } from 'vue';
import * as VueRouter from "vue-router";
import user_login from '/static/components/user_login.js';
import user_signup from '/static/components/user_signup.js';
import admin_login from '/static/components/admin_login.js';
import creator_login from '/static/components/creator_login.js';
import creator_signup from '/static/components/creator_signup.js';
import creator_home from '/static/components/creator_home.js';
import view_lyrics from '/static/components/view_lyrics.js';
import logout from '/static/components/log-out.js';
import create_album from '/static/components/create_album.js';
import manage_albums from '/static/components/manage_albums.js';
import new_creator_home from '/static/components/new_creator_home.js';
import edit_album from '/static/components/edit_album.js';
import upload_song from '/static/components/upload_song.js';
import edit_song from '/static/components/edit_song.js';
import creator_profile from '/static/components/creator_profile.js';
import update_creator_profile from '/static/components/update_creator_profile.js';
import collab_requests from '/static/components/collab_requests.js';
import user_home from '/static/components/user_home.js';
import top_playlists from '/static/components/top_playlists.js';
import playlists from '/static/components/playlists.js';
import view_creator_profile from '/static/components/view_creator_profile.js';
import user_profile from '/static/components/user_profile.js';
import search from '/static/components/search.js';
import admin_home from '/static/components/admin_home.js';
import view_songs from '/static/components/view_songs.js';
import view_albums from '/static/components/view_albums.js';
import admin_search from '/static/components/admin_search.js';

const routes = [
  {path: '/', component: user_login, name: 'user_login', props: true},
  {path: '/user/signup', component: user_signup, name: 'user_signup', props: true},
  {path: '/admin/login', component: admin_login, name: 'admin_login', props: true},
  {path: '/creator/login', component: creator_login, name: 'creator_login', props: true},
  {path: '/creator/signup', component: creator_signup, name: 'creator_signup', props: true},
  {path: '/creator', component: creator_home, name: 'creator_home', props: true},
  {path: '/song/:song_id/lyrics', component: view_lyrics, name: 'view_lyrics', props: true},
  {path: '/log-out', component: logout, name: 'logout', props: true},
  {path: '/creator/album', component: create_album, name: 'create_album', props: true},
  {path: '/creator/album/manage', component: manage_albums, name: 'manage_albums', props: true},
  {path: '/creator/new', component: new_creator_home, name: 'new_creator_home', props: true},
  {path: '/creator/album/:album_id/edit', component: edit_album, name: 'edit_album', props: true},
  {path: '/creator/song', component: upload_song, name: 'upload_song', props: true},
  {path: '/creator/song/:song_id/edit', component: edit_song, name: 'edit_song', props: true},
  {path: '/creator/profile', component: creator_profile, name: 'creator_profile', props: true},
  {path: '/creator/profile/update', component: update_creator_profile, name: 'update_creator_profile', props: true},
  {path: '/creator/collabs', component: collab_requests, name: 'collab_requests', props: true},
  {path: '/user', component: user_home, name: 'user_home', props: true},
  {path: '/user/top_playlists/:playlist_name', component: top_playlists, name: 'top_playlists', props: true},
  {path: '/user/playlist/:playlist_id', component: playlists, name: 'playlists', props: true},
  {path: '/user/creator_profile/:creator_id', component: view_creator_profile, name: 'view_creator_profile', props: true},
  {path: '/user/profile', component: user_profile, name: 'user_profile', props: true},
  {path: '/user/search', component: search, name: 'search', props: true},
  {path: '/admin', component: admin_home, name: 'admin_home', props: true},
  {path: '/admin/songs', component: view_songs, name: 'view_songs', props: true},
  {path: '/admin/albums', component: view_albums, name: 'view_albums', props: true},
  {path: '/admin/search', component: admin_search, name: 'admin_search', props: true},
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes
})

function clearLocalStorage() {
  localStorage.clear();
}

setInterval(function() {
    var now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        clearLocalStorage();
    }
}, 30000);


const app = createApp({
  el : '#app',
}).use(router).mount('#app');

export default router;