<template>
  <q-page padding class="flex flex-row w-full">
    <q-table grid :rows="rows"
      class="table-resource bg-transparent flex-none"
      :class="{
        'w-3/5': $q.screen.gt.sm,
        'w-full': !$q.screen.gt.sm
      }"
      :rows-per-page-options="[0]"
      >
      <template v-slot:top>
        <q-bar class="bg-primary text-white w-full">
          <div class="col text-center text-weight-bold">
            List of Company
          </div>
          <q-btn dense flat round icon="add_circle" @click="addTenance()" />
          <!-- <q-btn flat dense class="py-0" size="lg" color="primary" icon="add_circle" @click="addTenance()" /> -->
        </q-bar>
        <!-- <div class="pa-sm bg-accent text-primary w-full">
          <div class="text-h6 pl-2">
          </div>
          <q-space />
        </div> -->
      </template>
      <template v-slot:item="el">
        <div class="w-1/3 pr-4 pb-4">
          <q-card style="">
            <q-card-section class="pb-0">
              <div class="relative">
                <q-btn dense flat icon="info_outline" class="absolute left-0" />
                <q-btn dense flat icon="more_vert" class="absolute right-0" >
                  <q-menu auto-close>
                    <q-list style="min-width: 100px">
                      <q-item v-if="!isOwner(el.row)" clickable v-close-popup>
                        <q-item-section side><q-icon name="link"/></q-item-section>
                        <q-item-section>Revoke Access</q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item v-if="isAdministrator(el.row)" clickable @click="inviteUserTenance(el.row)">
                        <q-item-section side><q-icon name="person_add" /></q-item-section>
                        <q-item-section>Invite New User</q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item v-if="isAdministrator(el.row)" clickable @click="updateTenance(el.row)">
                        <q-item-section side><q-icon name="edit"/></q-item-section>
                        <q-item-section>Update Information</q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item v-if="isAdministrator(el.row)" clickable v-close-popup>
                        <q-item-section side><q-icon name="credit_card"/></q-item-section>
                        <q-item-section>Billing</q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item v-if="isOwner(el.row)" clickable v-close-popup>
                        <q-item-section side><q-icon name="block" color="red"/></q-item-section>
                        <q-item-section>Remove Data</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
              <div class="flex flex-col items-center gap-3 py-4">
                <q-avatar v-if="el.row.avatar?.mode === 'image'" size="100px">
                  <img :src="el.row.avatar.value || 'https://img.freepik.com/free-icon/user_318-563642.jpg?w=360'" />
                </q-avatar>
                <q-avatar v-else size="100px" font-size="52px"
                  :color="el.row.avatar?.iconColor || 'orange'"
                  text-color="white"
                  :icon="el.row.avatar?.value || 'corporate_fare'"
                />
                <q-badge class="text-subtitle1 pa-xs text-uppercase" transparent
                  :color="getTextColorCluster(el.row.cluster)"
                  :text-color="getColorCluster(el.row.cluster)"
                  :label="el.row.cluster"
                  />
                </div>
              </q-card-section>
            <q-card-section class="no-padding bg-secondary">
              <q-btn class="py-2 text-h6 text-white text-center w-full">
                <div class="ellipsis">
                  {{ el.row.name }}
                </div>
              </q-btn>
            </q-card-section>
          </q-card>
        </div>
        <!-- <q-card flat
          class="bg-transparent flex-none overflow-hidden scrol"
          style="min-height: 500px; max-height: calc(100vh - 80px)"
          :class="{
            'w-3/5': $q.screen.gt.sm,
            'w-full': !$q.screen.gt.sm
          }"
          >
          <q-card-section class="px-0">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            </div>
            <pre>{{ rows }}</pre>
          </q-card-section>
        </q-card> -->
      </template>
    </q-table>
    <q-card flat class="bg-transparent flex-none  w-2/5 pl-4"
      style="min-width: 350px;min-height: 500px; max-height: calc(100vh - 120px);"
      v-if="$q.screen.gt.sm && isAdsContent"
    >
      <ads-landing-side />
    </q-card>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { TenantInterface } from 'src/types/Tenant';
import AdsLandingSide from 'src/components/AdsLandingSide.vue';
import { useAuthStore } from 'src/extensions/middleware/store';
import { useTable } from 'src/extensions/resource';
import { getColorCluster, getTextColorCluster } from 'src/composables/system';
import { Dialog } from 'quasar';
import DialogTenantForm from 'src/components/DialogTenantForm.vue';
import DialogTenantUserForm from 'src/components/DialogTenantUserForm.vue';
import DialogInviteUserConfirm from 'src/components/DialogInviteUserConfirm.vue';

export default defineComponent({
  name: 'IndexPage',
  components: { AdsLandingSide },
  setup() {
    const store = useAuthStore();
    const isAdsContent = ref(true);

    const { rows, onLoad } = useTable<TenantInterface[]>(() => ({
      root: '/',
      api: {
        resource: '/api/tenants',
        load: {
          params: {
            includes:['owner'],
            fields: ['as_level', 'is_owner'],
          }
        }
      },
      pagination: {
        page: 1,
        rowsPerPage: 20,
      },
      columns: [],
    }));

    const inviteUserTenance = (row: TenantInterface) => {
      Dialog.create({
        component: DialogTenantUserForm,
        componentProps: {
          row,
        }
      })
    }

    const addTenance = () => {
      Dialog.create({
        component: DialogTenantForm,
      })
    }

    const updateTenance = (row: TenantInterface) => {
      Dialog.create({
        component: DialogTenantForm,
        componentProps: {
          row,
        }
      })
    }

    const onTenantInvite = () => {
      Dialog.create({
        component: DialogInviteUserConfirm,
      })
    }

    onMounted(() => {
      onLoad((r:unknown) => console.warn(r, rows.value))
      // onTenantInvite()
    })

    return {
      name: process.env.APP_NAME,
      isAdsContent,
      rows,
      inviteUserTenance,
      addTenance,
      updateTenance,
      getColorCluster,
      getTextColorCluster,
      isAdministrator: (row: TenantInterface) => String(row.as_level) === 'administrator',
      isOwner: (row: TenantInterface) => row.owner_uid && row.owner_uid === store.user?.id,
    };
  },
});
</script>

<style lang="scss">
.table-resource.q-table--grid
  .q-table__top {
    padding-left: 0;
  }
</style>
