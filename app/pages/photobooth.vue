<script setup lang="ts">
const route = useRoute()
await navigateTo(`/result?template=${route.query.template || 1}`, { replace: true })
</script>
