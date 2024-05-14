import { createApp } from 'vue';
import { ref } from 'vue';
import router from '/static/js/router.js';

const creator_profile = {
	template: `
	<div id="app">
	<div v-if="message" aria-live="polite" aria-atomic="true" class="position-relative">
	  <div class="toast-container position-absolute top-0 end-0 p-3">
	    <div id="toast" class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
	      <div class="toast-header">
	        <strong class="me-auto">{{message}}</strong>
	        <button type="button" @click="close_toast($event)" class="btn-close ms-2 mb-1" data-bs-dismiss="toast" aria-label="Close">
	          <span aria-hidden="true"></span>
	        </button>
	      </div>
	    </div>
	  </div>
	</div>

	<nav class="navbar navbar-expand-lg bg-body-tertiary">
	  <div class="container-fluid">
	    <div class="navbar-collapse collapse w-100 order-1 order-md-0 dual-collapse2">
	      <ul class="navbar-nav mr-auto">
	        <svg xmlns="http://www.w3.org/2000/svg" width="40px" height="45px" fill="white" class="bi bi-music-note" viewBox="0 0 16 16">
	          <path d="M9 13c0 1.105-1.12 2-2.5 2S4 14.105 4 13s1.12-2 2.5-2 2.5.895 2.5 2"/>
	          <path fill-rule="evenodd" d="M9 3v10H8V3z"/>
	          <path d="M8 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 13 2.22V4L8 5z"/>
	        </svg>
	        <router-link class="navbar-brand" to="/creator" style="font-size: 30px;">&nbsp;Harmonix</router-link>
	        
	      </ul>
	      <ul class="navbar-nav mr-auto" style="margin-left: 1150px;">
	      <div class="dropdown dropright">
	        <button role="button" @click="show_dropdown($event)" type="button" class="btn dropdown" to="#" data-bs-toggle="dropdown" id="dropdownMenu1" aria-haspopup="true" aria-expanded="false"> 
	          <span class="navbar-toggler-icon" style="height: 40px; width: 40px;"></span>
	      	</button>
	        <div id="dropdown" class="dropdown-menu pull-left" aria-labelledby="dropdownMenu1">
	          <router-link class="dropdown-item" to="/creator/album">Create Album</router-link>
	          <router-link class="dropdown-item" to="/creator/song">Upload Song</router-link>
	          <router-link class="dropdown-item" to="/creator/album/manage">Manage Albums</router-link>
	          <router-link class="dropdown-item" to="/creator/profile">Profile</router-link>
	          <router-link class="dropdown-item" to="/creator/collabs">Collaboration Requests</router-link>
	          <router-link class="dropdown-item" to="/user">Switch to User Profile</router-link>
	          <router-link class="dropdown-item" to="/log-out">Logout</router-link>
	        </div>
	      </div>
	    </ul>
	    </div>
	  </div>
	</nav><br><br>

	<div class="parent">
	  <router-link to="/creator/profile/update"><button id="button" class="button" type="submit" :style="{ float: 'left', 'background-image': 'url(' + creator_profile + ')' }"><p style="font-size:150px; text-align: center;"><svg id="edit" xmlns="http://www.w3.org/2000/svg" width="80" height="120" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/></svg></p></button></router-link>
	  <h1 style="float:left; padding-top: 60px; padding-bottom: 25px; font-family: Copperplate, Papyrus, fantasy;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{creator.creator_name}}</h1>
	</div><br><br>

	<h1>Popular</h1><br>
	<div>
	  <table class="table table-hover">
	      <tr v-for="(song, index) in songs" :key="index">
	        <td></td>
	        <td scope="row">{{ index + 1 }}</td>
	        <td><img :src="'../static/images/' + song.album_id + '.jpeg'" style="width:100px; height:100px; border-radius: 25px;">&nbsp;&hairsp;</td>
	        <td><h5>{{song.song_name}}</h5></td>
	        <td v-if="song.plays == 'None'">0</td>
	        <td v-if="song.plays != 'None'">{{song.plays}}</td>
	        <td>
	          <audio preload="auto" controls="controls" autobuffer>
	            <source :src="'../static/audio/' + song.song_id + '.mp3'" type="audio/mpeg">
	            Your browser does not support the audio element.
	          </audio>
	        </td>
	      </tr>
	  </table>
	</div>

	<div class="card text-center">
	  <div class="card-footer">Contact Us: 21f1001736@ds.study.iitm.ac.in</div>
	</div>`,

	data() {
		return {
		    token: null,
			user_id: localStorage.getItem('user_id'),
			role: null,
			creator_id: null,
			creator: {},
			creator_profile: null,
			plays: null,
			songs: {},
			message:this.$route.query.message,
		}
	},

	methods: {
		show_dropdown(event) {
			const element = document.getElementById("dropdown");
			if (this.dropdown) {
				element.classList.remove("show");
				this.dropdown = false;
			} else {
				element.classList.add("show");
				this.dropdown = true;
			}
		},

		close_toast(event) {
			this.auth = false;
     		this.delete_message = false;
     		this.message = false;
		},
	},

	async created() {
    	document.title = 'Creator Profile';

    	const response = await fetch(`/api/redis/get/${this.user_id}`);
    	const data = await response.json();
    	if (data.data) {
	    	this.token = data.data.token;
	    	this.role = data.data.role;
	    	this.creator_id = data.data.creator_id;
	    	console.log(data.data)
	    }

    	if (this.token && this.role == 'Creator') {
    		const queryParams = new URLSearchParams({
			    creator_id: this.creator_id,
			    token: this.token,
			    user_id: this.user_id,
			});

			const res = await fetch(`/api/creator/signup?${queryParams}`, {
		        method: 'GET',
		    });
		    const result = await res.json();
			if (result.status_code === 200) {
				this.creator = result.creator;
				this.creator_profile = result.creator_profile;
				this.plays = result.plays;
				this.songs = result.songs;
				console.log(this.creator_profile)

			}
  		} else if (this.token && this.role == 'User') {
  			router.push({
	    		name: 'user_home',
				query: { auth: true }
    		});
  		} else if (this.token && this.role == 'Admin') {
  			router.push({
	    		name: 'admin_home',
				query: { auth: true }
    		});
  		} else {
  			router.push({
	    		name: 'creator_login',
				query: { login: true }
    		});
  		}
  	},

	async mounted() {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = '/bootstrap/css/bootstrap.min.css';
		document.head.appendChild(link);

		const style = document.createElement('link');
		style.rel = 'stylesheet';
		style.href = '/css/creator_profile.css';
		document.head.appendChild(style);
	}
}

export default creator_profile