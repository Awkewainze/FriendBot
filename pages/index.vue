<script setup lang="ts">
  import {useRouter} from "#app";
  import { UserInfo } from "#components";

  const router = useRouter();
</script>

<template>
  <UserInfo avatarUrl="https://cdn.discordapp.com/avatars/181223459202924556/931d7819c8870c7086a9f357784649de.png" username="novahkiin"/>
  <a href="/working">working</a>
  <a href="/bad1" @click="router.push('/bad1')">bad1</a>
  <a href="/bad2" @click="router.push('/bad2')">bad2</a>
  <a href="/forceError">forceError</a>
</template>

<style scoped>

</style>