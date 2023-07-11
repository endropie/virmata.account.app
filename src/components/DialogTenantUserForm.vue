<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card class="max-w-sm" style="min-width: 50vw; min-height: 450px;">
      <q-tabs dense
        v-model="tab"
        inline-label
        align="justify"
        class="text-accent bg-secondary"
      >
        <q-tab name="invite" icon="person_add" label="Invite a user" />
        <q-tab name="users" icon="persons" label="User Access List" />
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="invite"  class="no-padding">
          <q-card v-if="record" flat >
            <q-card-section class="flex flex-col gap-4">
              <q-list dense>
                <q-item>
                  <q-item-section>
                    <q-item-label class="text-subtitle2">Access Type</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-for="opt in levelOptions" tag="label" v-ripple :key="opt.value">
                  <q-item-section avatar>
                    <q-radio dense v-model="record.level" :val="opt.value" :color="opt.color" />
                  </q-item-section>
                  <q-item-section class="pt-1 pb-2">
                    <q-item-label class="text-caption text-uppercase">{{ opt.value }}</q-item-label>
                    <q-item-label caption lines="2">{{ opt.description }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              <q-input v-model="record.context" type="text" label="Email or Mobile phone" />
            </q-card-section>
            <q-separator inset />
            <q-card-actions vertical align="center">
              <q-btn color="primary" class="w-full"  label="Invite new user" @click="onDialogOK" />
              <q-btn color="primary" class="w-full"  label="Cancel" flat @click="onDialogCancel" />
            </q-card-actions>
          </q-card>
        </q-tab-panel>
        <q-tab-panel name="users" class="no-padding">
          <div class="text-h6">Alarms</div>
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, Prop, ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { TenantInviteRecord, TenantInterface } from 'src/types/Tenant';


export default defineComponent({
  name: 'DialogTenantUserForm',
  props: {
    row: Object as Prop<TenantInterface| undefined>,
  },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  setup() {

    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

    const tab = ref('invite')

    const levelOptions = ref([
      { value: 'operator', color: 'blue', description: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur' },
      { value: 'visitor', color: 'blue-grey', description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatatnon proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' },
      { value: 'administrator', color: 'teal', description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
    ])

    const record = ref<TenantInviteRecord>({
      context: null,
      level: 'operator',
    });

    return {
      dialogRef, onDialogHide, onDialogOK, onDialogCancel,
      tab,
      record,
      levelOptions,
      show: () => {
        dialogRef.value?.show()
      }
    }
  }
});
</script>
