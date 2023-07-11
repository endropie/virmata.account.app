<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card class="max-w-md" style="min-width: 50vw" v-if="record">
      <q-bar dark class="bg-primary text-white">
        <div class="col text-center text-weight-bold"> New Company </div>
        <q-space />
        <div class="relative">
          <q-btn dense flat round icon="clear" size="8.5px" color="white" v-close-popup />
        </div>
      </q-bar>
      <q-card-section class="flex flex-col gap-4">
        <q-input v-model="record.name" type="text" label="Name" />
        <q-select label="Type" v-model="record.comptype_id" :options="comptypeOptions" />
        <div class="flex flex-row place-center gap-4">
          <div class="flex-grow">
            <q-input type="textarea" filled label="Address" v-model="record.address" autogrow
              input-style="min-height:80px" />
          </div>
          <div class="flex-none bg-grey-2 p-4" v-if="record.avatar?.mode === 'icon'">
            <q-avatar size="76px" font-size="40px"
              :color="record.avatar.color"
              :text-color="record.avatar.textColor"
              icon="directions" />
          </div>
        </div>
      </q-card-section>
      <q-separator inset />
      <q-card-actions vertical align="center">
        <q-btn color="primary" class="w-full"  label="Create new company" @click="onDialogOK" />
        <q-btn color="primary" class="w-full"  label="Cancel" flat @click="onDialogCancel" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { Prop, defineComponent, ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { TenantRecord, CompTypeInterface, TenantInterface } from 'src/types/Tenant';


export default defineComponent({
  name: 'DialogTenantForm',
  props: {
    row: Object as Prop<TenantInterface| undefined>,
  },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  setup() {

    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

    const record = ref<TenantRecord>({
      id: null,
      name: null,
      comptype_id: null,
      address: null,
      avatar: {
        mode: 'icon',
        value: 'corporate_fare',
        color: 'primary',
        textColor: 'white',
      }
    });

    const comptypeOptions = ref<CompTypeInterface[]>([])

    return {
      dialogRef, onDialogHide, onDialogOK, onDialogCancel,
      record,
      comptypeOptions,
      show: () => {
        dialogRef.value?.show()
      }
    }
  }
});
</script>
