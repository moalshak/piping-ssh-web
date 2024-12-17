<template>
  <v-app theme="dark">
    <v-app-bar flat>
      <v-container class="d-flex align-center">
        <v-avatar class="me-4 ms-4" color="grey-darken-3" size="32">
          <v-icon :icon="mdiConsoleLine"/>
        </v-avatar>
        <a href="" class="me-4 font-weight-bold" style="color: inherit; text-decoration: none">
          OpenSSH Key Manager
        </a>

        <v-spacer></v-spacer>

        <!-- TODO: manage known hosts -->
        <v-btn @click="keyManagerDialog = !keyManagerDialog" variant="text" :prepend-icon="mdiKey">
          Manage keys
        </v-btn>
        <v-btn :icon="mdiGithub" href="https://github.com/nwtgck/piping-ssh-web" target="_blank"/>
      </v-container>
    </v-app-bar>

    <v-main>
      
    </v-main>

    <v-dialog v-model="keyManagerDialog" scrollable width="90vw">
      <v-card>
        <v-card-title class="d-flex">
          <div class="ma-2">Keys</div>
          <v-spacer/>
          <v-btn @click="keyManagerDialog = false" :icon="mdiClose" variant="text"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text style="min-height: 70vh;">
          <div style="text-align: end; margin-bottom: 1rem;">
            <v-btn @click="newKeyDialog = !newKeyDialog" :prepend-icon="mdiPlus" color="secondary" style="margin-right: 1rem;">
              New
            </v-btn>
            <v-btn @click="generateKeyDialog = !generateKeyDialog" :prepend-icon="mdiAutoFix" color="secondary">
              Generate
            </v-btn>
          </div>
          <KeyManager />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="newKeyDialog" width="80vw">
      <v-card>
        <v-card-title class="d-flex">
          <div class="ma-2">New key</div>
          <v-spacer/>
          <v-btn @click="newKeyDialog = false" :icon="mdiClose" variant="text"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text style="min-height: 70vh;">
          <KeysEditor @save="saveAuthKeySet($event)"/>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="generateKeyDialog" width="80vw">
      <v-card>
        <v-card-title class="d-flex">
          <div class="ma-2">Key generator</div>
          <v-spacer/>
          <v-btn @click="generateKeyDialog = false" :icon="mdiClose" variant="text"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text style="min-height: 70vh;">
          <KeyGenerator @save="saveAuthKeySet($event)"/>
        </v-card-text>
      </v-card>
    </v-dialog>
    <DialogsForGlobal />
  </v-app>
</template>

<script setup lang="ts">
import {onMounted, ref, defineAsyncComponent} from "vue";
import {fragmentParams} from "@/fragment-params";
import {mdiConsoleLine, mdiKey, mdiPlus, mdiAutoFix, mdiGithub, mdiClose} from "@mdi/js";
import {AuthKeySet, storeAuthKeySet} from "@/authKeySets";
import DialogsForGlobal from "@/components/Globals/Globals.vue";
import {supportsRequestStreamsPromise} from "@/supportsRequestStreamsPromise";
const KeyManager = defineAsyncComponent(() => import("@/components/KeyManager.vue"));
const KeysEditor = defineAsyncComponent(() => import("@/components/KeysEditor.vue"));
const KeyGenerator = defineAsyncComponent(() => import("@/components/KeyGenerator.vue"));


const supportsRequestStreams = ref(true /* There are many Chromium-based browser users for now */);
supportsRequestStreamsPromise.then(supports => supportsRequestStreams.value = supports);

const connecting = ref<boolean>(false);

function connect() {
  connecting.value = true;
}

const keyManagerDialog = ref(false);
const newKeyDialog = ref(false);
const generateKeyDialog = ref(false);

onMounted(() => {
  if (fragmentParams.autoConnect()) {
    connect();
  }
  window.addEventListener('load', () => {
    preloadForUserExperience();
  });
});

function preloadForUserExperience() {
  import("xterm");
  import("xterm-addon-fit");
  import("clipboard-copy");
  import("@/components/KeyManager.vue");
  import("@/components/KeysEditor.vue");
  import("@/components/KeyGenerator.vue");
}


async function saveAuthKeySet(authKeySet: AuthKeySet) {
  newKeyDialog.value = false;
  generateKeyDialog.value = false;
  await storeAuthKeySet(authKeySet);
}

</script>

<style>
#app {
  font-family: "Avenir Next", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  //text-align: center;
  color: #2c3e50;
  margin-top: 15px;
}
</style>
