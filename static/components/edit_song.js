import { createApp } from 'vue';
import { ref } from 'vue';
import router from '/static/js/router.js';

const edit_song = {
	template: `
	<div id="app">
	  <div v-if="uniq" aria-live="polite" aria-atomic=true class="position-relative">
	    <div class="toast-container position-absolute top-0 end-0 p-3">
	      <div class="toast show" role="alert" aria-live="assertive" aria-atomic=true>
	        <div class="toast-header">
	          <strong class="me-auto">Song with the same has already been uploaded by you!</strong>
	          <button type="button" @click="close_toast($event)" class="btn-close ms-2 mb-1" data-bs-dismiss="toast" aria-label="Close">
	            <span aria-hidden=true></span>
	          </button>
	        </div>
	      </div>
	    </div>
	  </div>

	  <div v-if="creators_unavailable" aria-live="polite" aria-atomic=true class="position-relative">
	    <div class="toast-container position-absolute top-0 end-0 p-3">
	      <div class="toast show" role="alert" aria-live="assertive" aria-atomic=true>
	        <div class="toast-header">
	          <strong class="me-auto">No more creators available to collaborate with.</strong>
	          <button type="button" @click="close_toast($event)" class="btn-close ms-2 mb-1" data-bs-dismiss="toast" aria-label="Close">
	            <span aria-hidden=true></span>
	          </button>
	        </div>
	      </div>
	    </div>
	  </div>

	  <div v-if="select_value_check" aria-live="polite" aria-atomic=true class="position-relative">
	    <div class="toast-container position-absolute top-0 end-0 p-3">
	      <div class="toast show" role="alert" aria-live="assertive" aria-atomic=true>
	        <div class="toast-header">
	          <strong class="me-auto">Please select the previous collaborator to proceed.</strong>
	          <button type="button" @click="close_toast($event)" class="btn-close ms-2 mb-1" data-bs-dismiss="toast" aria-label="Close">
	            <span aria-hidden=true></span>
	          </button>
	        </div>
	      </div>
	    </div>
	  </div>

	  <div v-if="max" aria-live="polite" aria-atomic=true class="position-relative">
	    <div class="toast-container position-absolute top-0 end-0 p-3">
	      <div class="toast show" role="alert" aria-live="assertive" aria-atomic=true>
	        <div class="toast-header">
	          <strong class="me-auto">You've reached the maximum number of collaborators!</strong>
	          <button type="button" @click="close_toast($event)" class="btn-close ms-2 mb-1" data-bs-dismiss="toast" aria-label="Close">
	            <span aria-hidden=true></span>
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
	        <button role="button" @click="show_dropdown($event)" type="button" class="btn dropdown" to="#" data-bs-toggle="dropdown" id="dropdownMenu1" aria-haspopup=true aria-expanded="false"> 
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

	  <div class="login_form">
	    <h1> Edit Song </h1>
	    <form @submit.prevent="submit" action="/creator/song" method="POST" enctype="multipart/form-data">
	      <fieldset>
	        <div class="form-group">
	          <label for="song_name" class="form-label mt-4">Song Name</label>
	          <input class="form-control" id="song_name" placeholder="Julia" name="song_name" :value=curr_song.song_name style="width: 600px; margin: 10px auto;" required>
	        </div>

	        <div class="form-group">
	          <label for="album_id" class="form-label mt-4">Album Name</label>
	          <select class="form-select" id="album_id" name="album_id" style="width: 600px; margin: 10px auto;" required>
	            <option disabled selected value>Select Option</option>
	            <template v-for="album in albums" :key="album.album_id">
	             	<option v-if="curr_song.album_id == album.album_id" :value=album.album_id selected>{{album.album_name}}</option>
	            	<option v-else :value=album.album_id>{{album.album_name}}</option>
	            </template>
	          </select>
	        </div>

	        <div class="form-group">
	          <label for="lyrics" class="form-label mt-4">Lyrics</label>
	          <textarea class="form-control" name="lyrics" id="lyrics" style="width: 600px; margin: 10px auto; display:block; white-space: pre-wrap;">{{curr_song.lyrics}}</textarea>
	        </div>

	        <div class="form-group">
	          <label for="genre" class="form-label mt-4">Genre</label>
	          <select class="form-select" id="genre" name="genre" style="width: 600px; margin: 10px auto;" required>
	            <option disabled selected value>Select Option</option>
	            <template v-for="genre in genres" :key="genre.genre_id">
		            <option v-if="curr_song.genre == genre.genre_id" :value=genre.genre_id selected>{{genre.genre_name}}</option>
		            <option v-else :value=genre.genre_id>{{genre.genre_name}}</option>
		        </template>
	          </select>
	        </div>

	        <label for="duration" class="form-label mt-4">Duration</label><br>
	        <div class="form-group" id="duration" style="float:left; margin-left: 475px;">
	          <label for="minutes" class="form-label mt-4">Minutes</label>
	          <input id="minutes" type="number" name="minutes" :value=minutes style="width: 200px; margin: 10px auto;" required>
	        </div>

	        <div class="form-group" style="float:left;">
	          <label for="seconds" class="form-label mt-4">&nbsp;&nbsp;&nbsp;&nbsp;Seconds</label>
	          <input id="seconds" name="seconds" :value=seconds type="number" max="60" style="width: 200px; margin: 10px auto;" required>
	        </div>
	        <div style="clear:both;">&nbsp;</div>

	        <div>
	          <label for="audio" class="form-label mt-4">Audio</label>
	          <input class="form-control" type="file" id="audio" name="audio" accept=".mp3" @change="AudioUploaded($event)" style="width: 600px; margin: 10px auto;">
	        </div>

	        <div class="form-group" v-if="(counter>=1 && count >= 1) || curr_song.collaborator_1 !== null">
	          <label for="creator_id_1" class="form-label mt-4">Collaborator Name</label>
	          <select class="form-select" name="creator_id_1" id="creator_id_1" @change="onChange($event)" v-model="creator_id_1" style="width: 600px; margin: 10px auto;" required>
	            <option v-if="curr_song.collaborator_1 == null" disabled selected value>Select Option</option>
	            <template v-for="creator in creators" :key="creator.creator_id">
	            	<option selected v-if="curr_song.collaborator_1 == creator.creator_id" :value=creator.creator_id>{{creator.creator_name}}</option>
	            	<option v-if="curr_song.collaborator_1 != creator.creator_id && curr_song.collaborator_1 != null && creator.creator_id !== creator_id_2 && creator.creator_id !== creator_id_3 && creator.creator_id !== creator_id_4" :value=creator.creator_id disabled>{{creator.creator_name}}</option>
	                <option v-if="curr_song.collaborator_1 == null && curr_song.collaborator_1 != creator.creator_id && creator.creator_id !== creator_id_2 && creator.creator_id !== creator_id_3 && creator.creator_id !== creator_id_4" :value=creator.creator_id>{{creator.creator_name}}</option>
	            </template>
	          </select>
	        </div>

	        <div class="form-group" v-if="counter>=2 && creator_id_1 != null  && count >= 2 || curr_song.collaborator_2 !== null">
	          <label for="creator_id_2" class="form-label mt-4">Collaborator Name</label>
	          <select class="form-select" name="creator_id_2" id="creator_id_2" @change="onChange($event)" v-model="creator_id_2" style="width: 600px; margin: 10px auto;" required>
	            <option v-if="curr_song.collaborator_1 == null" disabled selected value>Select Option</option>
	            <template v-for="creator in creators" :key="creator.creator_id">
		            <option v-if="curr_song.collaborator_2 == creator.creator_id && creator.creator_id !== creator_id_1 && creator.creator_id !== creator_id_3 && creator.creator_id !== creator_id_4" selected :value=creator.creator_id>{{creator.creator_name}}</option>
		            <option v-if="curr_song.collaborator_2 != creator.creator_id && curr_song.collaborator_2 != null && creator.creator_id !== creator_id_1 && creator.creator_id !== creator_id_3 && creator.creator_id !== creator_id_4" :value=creator.creator_id disabled>{{creator.creator_name}}</option>
	                <option v-if="curr_song.collaborator_2 == null && curr_song.collaborator_2 != creator.creator_id && creator.creator_id !== creator_id_1 && creator.creator_id !== creator_id_3 && creator.creator_id !== creator_id_4" :value=creator.creator_id>{{creator.creator_name}}</option>
	            </template>
	          </select>
	        </div>

	        <div class="form-group" v-if="counter>=3 && creator_id_2 != null  && count >= 3 || curr_song.collaborator_3 !== null">
	          <label for="creator_id_3" class="form-label mt-4">Collaborator Name</label>
	          <select class="form-select" name="creator_id_3" id="creator_id_3" @change="onChange($event)" v-model="creator_id_3" style="width: 600px; margin: 10px auto;" required>
	            <option v-if="curr_song.collaborator_3 == null" disabled selected value>Select Option</option>
	            <template v-for="creator in creators" :key="creator.creator_id">
	            	<option v-if="curr_song.collaborator_3 == creator.creator_id && creator.creator_id !== creator_id_1 && creator.creator_id !== creator_id_2 && creator.creator_id !== creator_id_4" :value=creator.creator_id selected>{{creator.creator_name}}</option>
	                <option v-if="curr_song.collaborator_3 != null && curr_song.collaborator_3 != creator.creator_id && creator.creator_id !== creator_id_1 && creator.creator_id !== creator_id_2 && creator.creator_id !== creator_id_4" :value=creator.creator_id disabled>{{creator.creator_name}}</option>
	                <option v-if="curr_song.collaborator_3 == null && curr_song.collaborator_3 != creator.creator_id && creator.creator_id !== creator_id_1 && creator.creator_id !== creator_id_2 && creator.creator_id !== creator_id_4" :value=creator.creator_id>{{creator.creator_name}}</option>
	            </template>
	          </select>
	        </div>

	        <div class="form-group" v-if="counter>=4 && creator_id_3 != null  && count >= 4  || curr_song.collaborator_3 !== null">
	          <label for="creator_id_4" class="form-label mt-4">Collaborator Name</label>
	          <select class="form-select" name="creator_id_4" id="creator_id_4" @change="onChange($event)" v-model="creator_id_4" style="width: 600px; margin: 10px auto;" required>
	            <option v-if="curr_song.collaborator_4 == null" disabled selected value>Select Option</option>
	            <template v-for="creator in creators" :key="creator.creator_id">
	            	<option v-if="curr_song.collaborator_4 == creator.creator_id && creator.creator_id !== creator_id_1 && creator.creator_id !== creator_id_2 && creator.creator_id !== creator_id_3" :value=creator.creator_id selected>{{creator.creator_name}}</option>
	                <option v-if="curr_song.collaborator_4 != creator.creator_id && curr_song.collaborator_4 != null && creator.creator_id !== creator_id_1 && creator.creator_id !== creator_id_2 && creator.creator_id !== creator_id_3" :value=creator.creator_id disabled>{{creator.creator_name}}</option>
	                <option v-if="curr_song.collaborator_4 == null && curr_song.collaborator_4 != creator.creator_id && creator.creator_id !== creator_id_1 && creator.creator_id !== creator_id_2 && creator.creator_id !== creator_id_3" :value=creator.creator_id>{{creator.creator_name}}</option>
	            </template>
	          </select>
	        </div><br>


	        <div v-if="alert_closed && creator_id_1 != ''" class="alert alert-dismissible alert-primary">
	          <button type="button" class="btn-close" data-bs-dismiss="alert" @click="close()"></button>
	          <strong>The creators will be informed about your collaboration request. Sit tight till they accept!</strong>
	        </div><br v-if="alert_closed && creator_id_1 != ''">

	        <div v-if="count >= 1">
	          <button type="button" class="btn btn-success" @click="increase()">Add Collaborator</button>
	          <button type="button" class="btn btn-danger" @click="decrease()">Remove Collaborator</button>
	        </div><br>

	        <button type="submit" class="btn btn-primary">Submit</button>
	      </fieldset>
	    </form>
	  </div>
	</div>
	</div>
	</div><br>

	<div class="card text-center">
	  <div class="card-footer">Contact Us: 21f1001736@ds.study.iitm.ac.in</div>
	</div>`,

	data() {
		return {
			token: null,
			user_id: localStorage.getItem('user_id'),
			role: null,
			creator_id: null,
     		dropdown: false,
     		creator_id_1: "",
	        creator_id_2: "",
	        creator_id_3: "",
	        creator_id_4: "",
	        counter: 0,
	        select_value_check: false,
	        max: false,
	        creators_unavailable: false,
	        alert_closed: false,
	        isAudioUploaded: false,
	        uniq: false,
	        albums: {},
	        creators: {},
	        genres: {},
	        count: null,
	        audioFile: null,
	        song_id: this.$route.params.song_id,
	        curr_song: {},
	        minutes: null,
	        seconds:null,
	        collab_count: null,
		}
	},

	methods: {
		async submit(){
			const formData = new FormData();
			formData.append('song_name', document.getElementById('song_name').value);
			formData.append('album_id', document.getElementById('album_id').value);
			formData.append('lyrics', document.getElementById('lyrics').value);
			formData.append('genre_id', document.getElementById('genre').value);
			formData.append('minutes', document.getElementById('minutes').value);
			formData.append('seconds', document.getElementById('seconds').value);
            formData.append('audio', this.audioFile);
            formData.append('collaborator_1', this.creator_id_1);
            formData.append('collaborator_2', this.creator_id_2);
            formData.append('collaborator_3', this.creator_id_3);
            formData.append('collaborator_4', this.creator_id_4);
            formData.append('creator_id', this.creator_id);
            formData.append('song_id', this.song_id);
            formData.append('token', this.token);

		    const res = await fetch('/api/creator/song', {
		        method: 'PUT',
		        body: formData
		    });
		    const result = await res.json();

			if (result.status_code === 200) {
				router.push({
		    		name: 'creator_home',
		    		query: { message: "Song Updated Successfully!" },
	    		});
		    } else if (result.status_code === 401) {
		    	this.uniq = true
		    }
		},

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
			this.select_value_check = false;
     		this.creators_unavailable = false;
     		this.max = false;
     		this.uniq = false;
		},

		increase() {
	      if (this.counter == 0 && this.count){
	        if (this.count >= 1){
	          return this.counter++;
	        }
	        else{
	          this.creators_unavailable = true
	        }
	      }
	      if (this.counter == 1){
	        if (this.creator_id_1 != ""){
	          if (this.count >= 2){
	            return this.counter++;
	          }
	          else{
	            this.creators_unavailable = true
	          }
	        }
	        else {
	        	this.select_value_check = true;
	        }
	      }
	      if (this.counter == 2){
	        if (this.creator_id_1 != "" && this.creator_id_2 != ""){
	          if (this.count >= 3){
	            return this.counter++;
	          }
	          else{
	            this.creators_unavailable = true
	          }
	        }
	        else {
	          this.select_value_check = true;
	        }
	      }
	      if (this.counter == 3){
	        if (this.creator_id_1 != "" && this.creator_id_2 != "" && this.creator_id_3 != ""){
	          if (this.count >= 4){
	            return this.counter++;
	          }
	          else{
	            this.creators_unavailable = true
	          }
	        }
	        else {
	          this.select_value_check = true;
	        }
	      }
	      if (this.counter == 4){
	        this.max = true
	      }
	    },
	    decrease() {
	      if (this.counter >= 1 && this.counter > this.collab_count){
	        if (this.counter == 1){
	        	this.creator_id_1 = ""
	        } else if (this.counter == 2){
	        	this.creator_id_2 = ""
	        } else if (this.counter == 3){
	        	this.creator_id_3 = ""
	        } else if (this.counter == 4){
	        	this.creator_id_4 = ""
	        }
	        return this.counter--;
	      }
	    },
	    close(){
	      this.alert_closed = false;
	    },
	    first_collab(event) {
	      this.alert_closed = true
	    },
	    onChange(event) {
	      this.select_value_check = false;
	    },
	    AudioUploaded(event){
	      this.audioFile = event.target.files[0];
	    },
	},

	async created() {
    	document.title = 'Edit Song';

    	const response = await fetch(`/api/redis/get/${this.user_id}`);
    	const data = await response.json();
    	if (data.data) {
	    	this.token = data.data.token;
	    	this.role = data.data.role;
	    	this.creator_id = data.data.creator_id;
	    }

    	if (this.token && this.role == 'Creator') {
    		const queryParams = new URLSearchParams({
			    song_id: this.song_id,
			    creator_id: this.creator_id,
			    token: this.token,
			});

			const res = await fetch(`/api/creator/song?${queryParams}`, {
		        method: 'GET',
		    });
		    const result = await res.json();
			if (result.status_code === 200 && result.message === 'Retrieval Successful') {
				this.creators = result.creators;
				this.count = result.count;
				this.albums = result.albums;
				this.genres = result.genres;
				this.curr_song = result.curr_song;
				this.minutes = result.minutes;
				this.seconds = result.seconds;
				this.collab_count = result.collab_count;
				this.creator_id_1 = this.curr_song.collaborator_1;
				this.creator_id_2 = this.curr_song.collaborator_2;
				this.creator_id_3 = this.curr_song.collaborator_3;
				this.creator_id_4 = this.curr_song.collaborator_4;
			} else if (result.message === 'No Albums') {
		    	router.push({
		    		name: 'create_album',
		    		query: { no_albums: true }
	    		});
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
		style.href = '/css/main.css';
		document.head.appendChild(style);
	},
}

export default edit_song