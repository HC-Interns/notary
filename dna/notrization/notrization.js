// -----------------------------------------------------------------
//  This stub Zome code file was auto-generated by hc-scaffold
// -----------------------------------------------------------------

// -----------------------------------------------------------------
//  Exposed functions with custom logic https://developer.holochain.org/API_reference
// -----------------------------------------------------------------

function createNotaryDoc(notary_doc) {
  hash = commit("notary_doc", notary_doc);
  (notary_doc.list_of_signatories).forEach(function(element) {
    send(element, {
      "type": "sign_request",
      "notary_doc": notary_doc,
      "notary_base": hash
    });
  });
  return hash;
}

function receive(from, message) {
  if (message.type == "sign_request") {
    //copy for reference save on local
    commit("preliminary_notary_doc", {
      notary_doc: message.notary_doc,
      notary_base: message.notary_base
    });
  }
}

function sign(preliminary_hash) {
  preliminary = get(preliminary_hash);

  sig_hash = commit("signature", {
    sig_name: App.Agent.String,
    signature: sign(preliminary.notary_doc)
  });

  commit('signature_link', {
    Links: [{
      Base: preliminary.notary_base,
      Link: sig_hash,
      Tag: 'signature'
    }]
  });

}

//TODO TESTING required
function reject(preliminary_hash) {
  preliminary = get(preliminary_hash);
  try {
    status = getLinks(preliminary.notary_base, "status", {
      Load: true
    })

  } catch (e) {

    state_hash = commit('status_link', {
      Links: [{
        Base: preliminary.notary_base,
        Link: status_hash,
        Tag: 'status'
      }]
    });

    return state_hash;
  }

  state_hash = update("status", {
    state: "reject",
    comment: ""
  }, status[0].Hash);
return state_hash;
}


//TODO: REFACTOR, use getEntity
function getPreliminaryDoc() {
  var result = query({
    Return: {
      Hashes: true,
      Entries: true
    },
    Constrain: {
      EntryTypes: ["preliminary_notary_doc"]
    }
  });
  return result;
}

// Retreives notary_doc linked in my local chain
function getMyNotaryDocs() {
  var result = query({
    Return: {
      Hashes: true,
      Entries: true
    },
    Constrain: {
      EntryTypes: ["notary_doc"]
    }
  });

  return result;
}



// -----------------------------------------------------------------
//  The Genesis Function https://developer.holochain.org/genesis
// -----------------------------------------------------------------

function genesis() {
  return true;
}

// -----------------------------------------------------------------
//  Validation functions for every change to the local chain or DHT
// -----------------------------------------------------------------

function validateCommit(entryName, entry, header, pkg, sources) {
  //debug("entry_type:" + entryName + "entry" + JSON.stringify(entry) + "header" + JSON.stringify(header) + "PKG: " + JSON.stringify(pkg) + "sources" + sources);
  return validate(entryName, entry, header, pkg, sources);
}

function validate(entryName, entry, header, pkg, sources) {
  switch (entryName) {
    case "notary_doc":
      return true;
    case "notary_link":
      return true;
    case "anchor":
      return true;
    default:
      return false;
  }
}

function validatePut(entryName, entry, header, pkg, sources) {
  switch (entryName) {
    case "anchor":
      return true;
    default:
      return false;
  }

  return false;
}

function validateMod(entryName, entry, header, replaces, pkg, sources) {
  return false;
}

function validateDel(entryName, hash, pkg, sources) {
  return false;
}

function validateLink(entryName, baseHash, links, pkg, sources) {
  switch (entryName) {
    case "notary_link":
      return true;
    default:
      return false;
  }
  return false;
}

function validatePutPkg(entryName) {
  return null;
}

function validateModPkg(entryName) {
  return null;
}

function validateDelPkg(entryName) {
  return null;
}

function validateLinkPkg(entryName) {
  return null;
}
