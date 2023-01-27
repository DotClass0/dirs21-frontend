<template>
  <Menu></Menu>
  <b-modal id="insert-dish-modal" :title="insertDishModal.dish ? 'Gericht bearbeiten' : 'Gericht hinzufügen'" size="lg" scrollable
           @show="clearInsertDishModal" @ok="submitInsertDish">
    <template #modal-footer="{ cancel, ok }">
      <b-button v-if="insertDishModal.dish" variant="danger" v-b-modal.confirm-delete-modal>Gericht löschen</b-button>
      <b-button v-if="insertDishModal.dish" class="mr-auto" :variant="insertDishModal.dish.enabled ? 'warning' : 'success'" @click="updateDishVisibility">
        {{ insertDishModal.dish.enabled ? 'Deaktivieren' : 'Aktivieren' }}
      </b-button>
      <b-button @click="cancel">Abbrechen</b-button>
      <b-button variant="primary" @click="ok">{{ insertDishModal.dish ? 'Speichern' : 'Erstellen' }}</b-button>
    </template>
    <b-form>
      <b-form-group label="Name" invalid-feedback="Ungültiger Name">
        <b-form-input v-model="insertDishModal.name" :state="insertDishModal.nameValidated" @change="onNameChanged" required></b-form-input>
      </b-form-group>
      <b-form-group label="Beschreibung" invalid-feedback="Ungültige Beschreibung">
        <b-form-input v-model="insertDishModal.description" :state="insertDishModal.descriptionValidated" required></b-form-input>
      </b-form-group>
      <b-form-group label="Preis (Euro)" invalid-feedback="Ungültiger Preis">
        <b-form-input v-model="insertDishModal.price" :state="insertDishModal.priceValidated" type="number" required></b-form-input>
      </b-form-group>
      <b-form-group label="Kategorie" invalid-feedback="Kategorie auswählen">
        <b-form-select v-model="insertDishModal.category" :options="categories" :state="insertDishModal.categoryValidated" required></b-form-select>
      </b-form-group>
      <b-form-group>
        <label id="label-subcategory">Unterkategorie</label>
        <b-tooltip target="label-subcategory" placement="right" variant="primary">Dieser Wert ist optional und nur für die Sortierung innerhalb der Kategorie relevant</b-tooltip>
        <b-form-input v-model="insertDishModal.subcategory"></b-form-input>
      </b-form-group>
      <b-form-group label="Verfügbarkeit">
        <b-form-checkbox-group v-model="insertDishModal.availability" :options="availabilities"></b-form-checkbox-group>
        <b-form-checkbox-group v-model="insertDishModal.availability" :options="availabilities2"></b-form-checkbox-group>
      </b-form-group>
      <b-form-group label="Durchschnittliche Wartezeit (Minuten)" invalid-feedback="Ungültige Zeit">
        <b-form-input v-model="insertDishModal.waitingTime" :state="insertDishModal.waitingTimeValidated" type="number" required></b-form-input>
      </b-form-group>
      <b-form-group label="Zusätzliche Eigenschaften">
        <b-form-checkbox-group v-model="insertDishModal.properties" :options="properties"></b-form-checkbox-group>
      </b-form-group>
    </b-form>
  </b-modal>
  <b-modal v-if="insertDishModal.dish" id="confirm-delete-modal" title="Gericht löschen" cancel-title="Abbrechen" ok-title="Bestätigen" ok-variant="danger" @ok="submitDeleteDish"
           centered>Soll {{ insertDishModal.dish?.name }} wirklich endgültig gelöscht werden?<br>Dieser Vorgang ist unwiderruflich.
  </b-modal>
</template>

<script>
import Menu from "@/components/menu/Menu";
export default {
  name: "MenuEditor",
  components: { Menu }
}
</script>

<style scoped>

</style>