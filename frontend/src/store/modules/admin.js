import axios from 'axios'

const admin = {
   namespaced: true,
   state: {
      accessions: [],
      totalAccessions: 0,
      filteredTotal: 0,
      page: 0,
      pageSize: 0,
      accessionDetail: null,
      queryStr: "",
   },
   getters: {
      loginName(_state, _getters, rootState) {
         if (rootState.user == null) {
            return ""
         }
         return rootState.user.firstName + " (" + rootState.user.email + ")"
      }
   },
   mutations: {
      resetAccessionsSearch(state) {
         state.queryStr = ""
         state.page = 1
         state.filteredTotal = 0
         state.total = 0
         state.accessions.length = 0
      },
      setAccessionsPage(state, resp) {
         console.log("FILTERED TOTAL: "+resp.filteredTotal)
         state.totalAccessions = resp.total
         state.filteredTotal = resp.filteredTotal
         state.page = resp.page
         state.pageSize = resp.pageSize
         state.accessions = resp.accessions
      },
      clearAccessionDetail(state) {
         state.accessionDetail = null
      },
      setAccessionDetail(state, data) {
         state.accessionDetail = data
      },
      updateSearchQuery(state, val) {
         state.queryStr = val
      },
      gotoFirstPage(state) {
         state.page = 1
      },
      gotoLastPage(state) {
         state.page = Math.floor(state.totalAccessions / state.pageSize) + 1
      },
      nextPage(state) {
         state.page++
      },
      prevPage(state) {
         state.page--
      },
   },
   actions: {
      firstPage(ctx) {
         ctx.commit('gotoFirstPage')
         ctx.dispatch("getAccessionsPage")
      },
      prevPage(ctx) {
         ctx.commit('prevPage')
         ctx.dispatch("getAccessionsPage")
      },
      nextPage(ctx) {
         ctx.commit('nextPage')
         ctx.dispatch("getAccessionsPage")
      },
      lastPage(ctx) {
         ctx.commit('gotoLastPage')
         ctx.dispatch("getAccessionsPage")
      },
      getAccessionsPage(ctx) {
         ctx.commit("setLoading", true, { root: true })
         let url = "/api/admin/accessions?page=" + ctx.state.page
         if (ctx.state.queryStr.length > 0) {
            url = url + "&q=" + ctx.state.queryStr
         }
         axios.get(url, { withCredentials: true }).then((response) => {
            ctx.commit('setAccessionsPage', response.data)
            ctx.commit("setLoading", false, { root: true })
         }).catch(() => {
            ctx.commit('setError', "Internal Error: Unable to get accessions", { root: true })
            ctx.commit("setLoading", false, { root: true })
         })
      },
      getAccessionDetail(ctx, id) {
         ctx.commit("setLoading", true, { root: true })
         ctx.commit('clearAccessionDetail')
         axios.get("/api/admin/accessions/" + id).then((response) => {
            ctx.commit('setAccessionDetail', response.data)
            ctx.commit("setLoading", false, { root: true })
         }).catch(() => {
            ctx.commit('setError', "Internal Error: Unable to get accession detail", { root: true })
            ctx.commit("setLoading", false, { root: true })
         })
      }
   }
}
export default admin