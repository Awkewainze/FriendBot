<script setup lang="ts">
	const props = defineProps<{
		username: string,
		/** Url of avatar image */
		avatarUrl: string
	}>();

	async function logout(): Promise<void> {
		console.log("logout");
	}
</script>

<template>
	<div class="user-info border-indigo-900  bg-slate-900 px-2 flex flex-col items-center p-4 m-4 rounded w-28">
		<div>
			<img class="flex-row h-16 w-16 rounded-full ring-2 ring-white m-2" :src="avatarUrl" alt="{{ username }}'s profile picture'" />
		</div>
		<div>
			<p class="flex-row w-full text-slate-200 m-2">{{username}}</p>
		</div>
		<div>
			<button class="bg-red-500 hover:bg-red-400 rounded p-2 mx-2 border-red-600 text-slate-200" @click="logout()">Logout</button>
		</div>
	</div>
</template>

<style scoped>

</style>
