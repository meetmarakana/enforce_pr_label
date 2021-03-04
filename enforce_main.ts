import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
  try {
    const labels = github.context!.payload!.pull_request!.labels;
    enforceAnyLabels(labels);
    enforceTeamLabels(labels);
    enforceAllLabels(labels);
    enforceBannedLabels(labels);

  } catch (error) {
    core.setFailed(error.message);
  }
}

function enforceAnyLabels(labels) {
  const requiredLabelsAny: string[] = getInputArray('REQUIRED_LABELS_ANY');
  if (requiredLabelsAny.length > 0){
    var flag = false;
    for (var i=0; i < labels.length; i++){
      if (requiredLabelsAny.includes(labels[i].name)){
        flag = true;
        break;
      }
    }
    if (!flag){
      const requiredLabelsAnyDescription = `Please select one of the required labels for this PR: ${requiredLabelsAny}`;
      core.setFailed(requiredLabelsAnyDescription);
    }
  }
}

function enforceTeamLabels(labels) {
  if (labels.length > 0){
    var flag = false;
    for (var i=0; i < labels.length; i++){
      if (labels[i].name.toLowerCase().includes("team_")){
        if(flag){
          const errorMultipleTeamDescription = `Please select only one team label instead of selecting multiple team labels for this PR`;
          core.setFailed(errorMultipleTeamDescription);
          return false;
        }
        flag = true;
      }
    }
    if (!flag){
      const requiredLabelsTeamDescription = `Please select any team label for this PR`;
      core.setFailed(requiredLabelsTeamDescription);
    }
    
  }else{
    const requiredLabelsTeamDescription = `Please select any team label for this PR`;
    core.setFailed(requiredLabelsTeamDescription);
  }
}

function enforceAllLabels(labels) {
  const requiredLabelsAll = getInputArray('REQUIRED_LABELS_ALL');
  if (!requiredLabelsAll.every(requiredLabel => labels.find(l => l.name === requiredLabel))) {
    const requiredLabelsAllDescription = `All labels are required for this PR: ${requiredLabelsAll}`;
    core.setFailed(requiredLabelsAllDescription);
  }
}

function enforceBannedLabels(labels) {
  const bannedLabels = getInputArray('BANNED_LABELS');
  let bannedLabel;
    if (bannedLabels && (bannedLabel = labels.find(l => bannedLabels.includes(l.name)))) {
      const bannedLabelsDescription = `${bannedLabel.name} label is banned`;
      core.setFailed(bannedLabelsDescription);
    }
}

function getInputArray(name): string[] {
  const rawInput = core.getInput(name, {required: false});
  return rawInput !== '' ? rawInput.split(',') : [];
}

function getInputString(name, defaultValue): string {
  const rawInput = core.getInput(name, {required: false});
  return rawInput !== '' ? rawInput : defaultValue;
}

run();