const clusterOptions = [
  { name: 'lite', color: 'blue-grey', textColor: 'blue-grey-2' },
  { name: 'essential', color: 'blue', textColor: 'blue-2' },
  { name: 'professional', color: 'indigo', textColor: 'indigo-2' },
  { name: 'enterprise', color: 'green', textColor: 'green-2' },
];

const getColorCluster = (name: string) => {
  return clusterOptions.find((e) => e.name == name)?.color || 'black';
};

const getTextColorCluster = (name: string) => {
  return clusterOptions.find((e) => e.name == name)?.textColor || 'white';
};

export { getColorCluster, getTextColorCluster };
