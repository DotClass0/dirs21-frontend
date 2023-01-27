<template>
  <div v-if="$store.getters.dishes">
    <b-button class="btn-outline-primary" id="add-button" variant="outline-primary" v-b-modal.insert-dish-modal>Gericht hinzufügen</b-button>
    <h1 class="display-4 text-center mt-4 mb-3">Speisekarte</h1>
    <div class="mb-4" v-for="category in categories" v-if="$store.getters.byCategory[category.value]">
      <h3 class="font-weight-bold">{{ category.text2 ?? category.text }}</h3>
      <div class="mt-3 mb-4" v-for="dish in $store.getters.byCategory[category.value]">
        <b-card :class="{'strike-through': !dish.enabled}" @click="openEditDishModal(dish)">
          <div class="d-flex justify-content-between align-items-center">
            <b-card-title class="font-weight-bold">{{ dish.name }}</b-card-title>
            <div class="card-end d-flex align-items-center" @click.stop>
              <b-badge class="ml-1" v-for="property in properties.filter(e => dish.properties.includes(e.value)).filter((e,i,a)=>!a[i+1]?.overrides?.includes(e.value))"
                       :style="{'background-color': property.color}">{{
                  property.text
                }}
              </b-badge>
              <template v-if="dish.waitingTime > 0">
                <b-icon-clock-history :id="'clock' + dish._id" class="ml-3" font-scale="1.5"
                                      :style="{color: dish.waitingTime >= 40 ? 'red' : dish.waitingTime >= 20 ? 'orange' : 'green'}"></b-icon-clock-history>
                <b-popover :target="'clock' + dish._id" title="Durchschnittliche Wartezeit" triggers="hover" placement="top">
                  {{ dish.waitingTime }} Minuten
                </b-popover>
              </template>
              <template v-if="availabilities.some(e => dish.availability.includes(e.value)) && availabilities2.some(e => dish.availability.includes(e.value))">
                <b-icon-calendar2-week :id="'calendar' + dish._id" class="ml-3" font-scale="1.5"></b-icon-calendar2-week>
                <b-popover :target="'calendar' + dish._id" title="Verfügbarkeit" triggers="hover" placement="top">
                  {{ availabilityDescription(dish) }}
                  <br>
                  {{ availability2Description(dish) }}
                </b-popover>
              </template>
            </div>
          </div>
          <b-card-text>{{ dish.description }}</b-card-text>
          <b-card-text class="font-weight-bold h5">{{ (dish.price / 100).toLocaleString(undefined, { style: 'currency', currency: 'EUR' }) }}</b-card-text>
        </b-card>
      </div>
    </div>
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
  </div>
</template>

<script>
const defaultAvailability = ['breakfast', 'lunch', 'dinner', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const listFormat = new Intl.ListFormat()

export default {
  name: "Menu",
  data: () => ({
    insertDishModal: {
      dish: null,
      name: '',
      nameValidated: null,
      description: '',
      descriptionValidated: null,
      price: null,
      priceValidated: null,
      category: null,
      categoryValidated: null,
      subcategory: null,
      availability: defaultAvailability,
      waitingTime: null,
      waitingTimeValidated: null,
      properties: []
    },
    categories: [
      { value: 'starter', text: 'Vorspeise', text2: 'Vorspeisen' },
      { value: 'salad', text: 'Salat', text2: 'Salate' },
      { value: 'main', text: 'Hauptgericht', text2: 'Hauptgerichte' },
      { value: 'sides', text: 'Beilage', text2: 'Beilagen' },
      { value: 'dessert', text: 'Nachtisch' },
      { value: 'beverage1', text: 'Alkoholfreies Getränk', text2: 'Alkoholfreie Getränke' },
      { value: 'beverage2', text: 'Alkoholisches Getränk', text2: 'Alkoholische Getränke' }
    ],
    availabilities: [
      { value: 'breakfast', text: 'Frühstück' },
      { value: 'lunch', text: 'Mittags' },
      { value: 'dinner', text: 'Abends' }
    ],
    availabilities2: [
      { value: 'monday', text: 'Montag', text2: 'Montags' },
      { value: 'tuesday', text: 'Dienstag', text2: 'Dienstags' },
      { value: 'wednesday', text: 'Mittwoch', text2: 'Mittwochs' },
      { value: 'thursday', text: 'Donnerstag', text2: 'Donnerstags' },
      { value: 'friday', text: 'Freitag', text2: 'Freitags' },
      { value: 'saturday', text: 'Samstag', text2: 'Samstags' },
      { value: 'sunday', text: 'Sonntag', text2: 'Sonntags' }
    ],
    properties: [
      { value: 'vegetarian', text: 'Vegetarisch', color: '#17ad39' },
      { value: 'vegan', text: 'Vegan', overrides: ['vegetarian'], color: '#158a2f' },
      { value: 'glutenFree', text: 'Glutenfrei', color: '#dc9f18' },
      { value: 'lactoseFree', text: 'Laktosefrei', color: '#3e97cf' }
    ]
  }),
  methods: {
    availabilityDescription(dish) {
      return listFormat.format(this.availabilities.filter(e => dish.availability.includes(e.value)).map(e => e.text))
    },
    availability2Description(dish) {
      const availabilities = listFormat.format(this.availabilities2.filter(e => !dish.availability.includes(e.value)).map(e => e.text))
      return availabilities.length > 0 ? `nicht ${availabilities}` : availabilities
    },
    openEditDishModal(dish) {
      this.$bvModal.show('insert-dish-modal')
      this.insertDishModal.dish = dish
      this.insertDishModal.name = dish.name
      this.insertDishModal.description = dish.description
      this.insertDishModal.price = dish.price / 100
      this.insertDishModal.category = dish.category
      this.insertDishModal.subcategory = dish.subcategory
      this.insertDishModal.availability = dish.availability
      this.insertDishModal.waitingTime = dish.waitingTime
      this.insertDishModal.properties = dish.properties
    },
    clearInsertDishModal() {
      this.insertDishModal.dish = null
      this.insertDishModal.name = ''
      this.insertDishModal.nameValidated = null
      this.insertDishModal.description = ''
      this.insertDishModal.descriptionValidated = null
      this.insertDishModal.price = null
      this.insertDishModal.priceValidated = null
      this.insertDishModal.category = null
      this.insertDishModal.categoryValidated = null
      this.insertDishModal.subcategory = null
      this.insertDishModal.availability = defaultAvailability
      this.insertDishModal.waitingTime = null
      this.insertDishModal.waitingTimeValidated = null
      this.insertDishModal.properties = []
    },
    onNameChanged() {
      if (!!this.insertDishModal.name.trim() && this.insertDishModal.subcategory == null) {
        this.insertDishModal.subcategory = this.insertDishModal.name.trimStart().split(' ')[0]
      }
    },
    submitInsertDish(event) {
      event.preventDefault()
      if ((this.insertDishModal.nameValidated = !!this.insertDishModal.name.trim()) /*& (this.insertDishModal.descriptionValidated = !!this.insertDishModal.description.trim())*/ &
          (this.insertDishModal.priceValidated = !!this.insertDishModal.price && this.insertDishModal.price > 0) &
          (this.insertDishModal.categoryValidated = !!this.insertDishModal.category) &
          (this.insertDishModal.waitingTimeValidated = (!this.insertDishModal.waitingTime || this.insertDishModal.waitingTime >= 0) ? null : false) !== false) {
        this.$store.dispatch('insertDish',
            {
              enabled: true,
              ...this.insertDishModal.dish,
              name: this.insertDishModal.name.trim(),
              description: this.insertDishModal.description.trim(),
              price: Math.round(this.insertDishModal.price * 100),
              category: this.insertDishModal.category,
              subcategory: this.insertDishModal.subcategory?.trim(),
              availability: this.insertDishModal.availability,
              waitingTime: Math.round(this.insertDishModal.waitingTime),
              properties: this.insertDishModal.properties
            })
        this.$nextTick(() =>
            this.$bvModal.hide('insert-dish-modal')
        )
      }
    },
    submitDeleteDish() {
      this.$store.dispatch('deleteDish', this.insertDishModal.dish)
      this.$nextTick(() =>
          this.$bvModal.hide('insert-dish-modal')
      )
    },
    updateDishVisibility() {
      this.$set(this.insertDishModal.dish, 'enabled', !this.insertDishModal.dish.enabled)
      this.$store.dispatch('insertDish', this.insertDishModal.dish)
    }
  }
}
</script>

<style scoped lang="scss">
#add-button {
  background-color: #fff;
  position: fixed;
  z-index: 100;
  top: 1.5rem;
  right: 3rem;

  &:hover {
    background-color: #007bff;
  }
}

.card {
  border-radius: 0.3rem;
  cursor: pointer;

  &:hover {
    background-color: rgb(250, 250, 250)
  }
}

.card-end {
  margin-bottom: 0.75rem;
}

.strike-through {
  position: relative;
}

.strike-through:before {
  position: absolute;
  content: "";
  left: 0;
  top: 50%;
  right: 0;
  border-top: 2px solid;
  border-color: red;
  transform: rotate(-10deg);
}
</style>