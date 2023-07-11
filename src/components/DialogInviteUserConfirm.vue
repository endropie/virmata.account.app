<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card v-if="record" flat >
      <q-card-section class="flex flex-col gap-4">
        TENANT INVITE
      </q-card-section>
      <q-separator inset />
      <q-card-actions vertical align="center">
        <q-btn color="primary" class="w-full"  label="Invite new user" @click="onDialogOK" />
        <q-btn color="primary" class="w-full"  label="Cancel" flat @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Cookies, useDialogPluginComponent } from 'quasar';
import { TenantInviteInterface } from 'src/types/Tenant';
import { api } from 'src/boot/axios';


export default defineComponent({
  name: 'DialogInviteUserConfirm',
  emits: [
    ...useDialogPluginComponent.emits
  ],
  setup() {

    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

    const record = ref<TenantInviteInterface | null>(null);

    return {
      dialogRef, onDialogHide, onDialogOK, onDialogCancel,
      record,
      show: () => {
        const token = Cookies.get('invite_token')
        console.warn('TOKEN:', token, Cookies.getAll())
        if (token) {
          api.get<TenantInviteInterface>(`api/tenant-invite/${token}`)
            .then((response) => {
              console.warn('response::', response)
            })
            .catch((error) => console.error(error))

          // dialogRef.value?.show()
        }
      }
    }
  }
});
</script>
