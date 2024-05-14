import { createApp } from 'vue';
import { ref } from 'vue';
import router from '/static/js/router.js';

const logout = {
	data() {
		return {
			user_id: localStorage.getItem('user_id'),
			role: null,
		}
	},

	async created() {
		const response = await fetch(`/api/redis/get/${this.user_id}`);
    	const data = await response.json();
    	this.role = data.data.role;

		localStorage.clear()

		const res = await fetch(`/api/redis/delete/${this.user_id}`, {
			method: 'POST',
            });

		if (this.role == 'User') {
			router.push({
	    		name: 'user_login'
    		});
  		} else if (this.role == 'Admin') {
  			router.push({
	    		name: 'admin_login',
    		});
  		} else {
  			router.push({
	    		name: 'creator_login',
    		});
  		}
	}
}

export default logout