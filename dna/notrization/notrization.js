// -----------------------------------------------------------------
//  This stub Zome code file was auto-generated by hc-scaffold
// -----------------------------------------------------------------

// -----------------------------------------------------------------
//  Exposed functions with custom logic https://developer.holochain.org/API_reference
// -----------------------------------------------------------------

function getKeyHash() {
  debug(App.Key.Hash)
  return App.Key.Hash;
}

function createNotaryDoc(notary_doc) {
  hash = commit("notary_doc", notary_doc);
  //create an anchors on the DHT for this DOC
  anchor = commit("notary_anchor", hash);
  sendToBeSigned(notary_doc, hash);
  return hash;
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

function approve(preliminary_hash) {
  preliminary = get(preliminary_hash, {
    Local: true
  });
  debug("Approving this Doc" + preliminary)

  //debug("Signature: "+sign(JSON.stringify(preliminary.notary_doc)));

  sig_hash = commit("signature", {
    sig_name: App.Agent.String,
    signature: sign(JSON.stringify(preliminary.notary_doc))
  });

  link_hash = commit('signature_link', {
    Links: [{
      Base: makeHash("notary_anchor", preliminary.notary_base),
      Link: sig_hash,
      Tag: 'sig'
    }]
  });
  return sig_hash;
}

function checkSignatures(notary_hash) {
  data = get(notary_hash, {
    Local: true
  });
  //debug("DATA :: " + JSON.stringify(data));
  signature_list = getSignatures(makeHash("notary_anchor", notary_hash));
  return verifySign(signature_list, data);
}

function getSignatures(notary_anchor) {
  return getLinks(notary_anchor, "sig", {
    Load: true
  });
}

function verifySign(signature_list, data) {
  return_verify_info = [];
  signature_list.forEach(function(element) {
    //debug("SIGNATURE: " + element.Entry.signature + "DATA: " + data + "PUBLIC KEY: " + element.Source);
    public_key = JSON.stringify(get(element.Source));
    debug("public_key: " + public_key);
    sliced_public_key = public_key.slice(45, 94);
    debug("Sliced Public Key: " + sliced_public_key);
    result = verifySignature(element.Entry.signature, JSON.stringify(data), sliced_public_key);
    return_verify_info.push(result);
  });
  return return_verify_info;
}


/****** NON Exposed ******/
function receive(from, message) {
  debug("Receiving From: " + from + " message: " + JSON.stringify(message));
  if (message.type == "sign_request") {
    //copy for reference save on local
    addToPreliminary(message);
  }
}

function sendToBeSigned(notary_doc, hash) {
  (notary_doc.list_of_signatories).forEach(function(element) {
    send(element, {
      "type": "sign_request",
      "notary_doc": notary_doc,
      "notary_base": hash
    });
  });
}

function addToPreliminary(message) {
  commit("preliminary_notary_doc", {
    notary_doc: message.notary_doc,
    notary_base: message.notary_base
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
    case "notary_anchor":
      return true;
    case "preliminary_notary_doc":
      return true;
    case "signature":
      return true;
    case "signature_link":
      return true;
    default:
      return false;
  }
}

function validatePut(entryName, entry, header, pkg, sources) {
  return validate(entryName, entry, header, pkg, sources);

}

function validateMod(entryName, entry, header, replaces, pkg, sources) {
  return false;
}

function validateDel(entryName, hash, pkg, sources) {
  return false;
}

function validateLink(entryName, baseHash, links, pkg, sources) {
  switch (entryName) {
    case "signature_link":
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
